package article

import (
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/gothinkster/golang-gin-realworld-example-app/internal/auth"
	"github.com/gothinkster/golang-gin-realworld-example-app/pkg/database"
	"gorm.io/gorm"
)

type ArticleModel struct {
	gorm.Model
	Slug        string `gorm:"uniqueIndex"`
	Title       string
	Description string
	Body        string
	Status      string `gorm:"default:'published'"`
	ReadTime    uint
	Author      ArticleUserModel `gorm:"foreignKey:AuthorID"`
	AuthorID    uint
	Tags        []TagModel       `gorm:"many2many:article_tags;"`
	Comments    []CommentModel   `gorm:"foreignKey:ArticleID"`
	Versions    []ArticleVersion `gorm:"foreignKey:ArticleID"`
	SlugHistory []SlugHistory    `gorm:"foreignKey:ArticleID"`
}

// FIXED: Removed gorm.Model to prevent 'updated_at' SQL crashes during version history inserts
type ArticleVersion struct {
	ID          uint `gorm:"primarykey"`
	CreatedAt   time.Time
	ArticleID   uint
	Title       string
	Description string
	Body        string
	Snapshot    string
}

// FIXED: Removed gorm.Model to prevent 'updated_at' SQL crashes
type SlugHistory struct {
	ID           uint `gorm:"primarykey"`
	CreatedAt    time.Time
	ArticleID    uint
	PreviousSlug string `gorm:"uniqueIndex"`
}

type ArticleUserModel struct {
	gorm.Model
	UserModel      auth.UserModel `gorm:"foreignKey:UserModelID"`
	UserModelID    uint
	ArticleModels  []ArticleModel  `gorm:"foreignKey:AuthorID"`
	FavoriteModels []FavoriteModel `gorm:"foreignKey:FavoriteByID"`
}

type FavoriteModel struct {
	gorm.Model
	Favorite     ArticleModel
	FavoriteID   uint
	FavoriteBy   ArticleUserModel
	FavoriteByID uint
}

type TagModel struct {
	gorm.Model
	Tag           string         `gorm:"uniqueIndex"`
	ArticleModels []ArticleModel `gorm:"many2many:article_tags;"`
}

type CommentModel struct {
	gorm.Model
	Article   ArticleModel
	ArticleID uint
	Author    ArticleUserModel
	AuthorID  uint
	Body      string `gorm:"size:2048"`
}

func GetArticleUserModel(userModel auth.UserModel) ArticleUserModel {
	var articleUserModel ArticleUserModel
	if userModel.ID == 0 {
		return articleUserModel
	}
	db := database.GetDB()
	db.Where(&ArticleUserModel{UserModelID: userModel.ID}).FirstOrCreate(&articleUserModel)
	articleUserModel.UserModel = userModel
	return articleUserModel
}

func (article ArticleModel) favoritesCount() uint {
	db := database.GetDB()
	var count int64
	db.Model(&FavoriteModel{}).Where(FavoriteModel{FavoriteID: article.ID}).Count(&count)
	return uint(count)
}

func (article ArticleModel) isFavoriteBy(user ArticleUserModel) bool {
	db := database.GetDB()
	var favorite FavoriteModel
	db.Where(FavoriteModel{FavoriteID: article.ID, FavoriteByID: user.ID}).First(&favorite)
	return favorite.ID != 0
}

func BatchGetFavoriteCounts(articleIDs []uint) map[uint]uint {
	if len(articleIDs) == 0 {
		return make(map[uint]uint)
	}
	db := database.GetDB()
	type result struct {
		FavoriteID uint
		Count      uint
	}
	var results []result
	db.Model(&FavoriteModel{}).Select("favorite_id, COUNT(*) as count").Where("favorite_id IN ?", articleIDs).Group("favorite_id").Find(&results)
	countMap := make(map[uint]uint)
	for _, r := range results {
		countMap[r.FavoriteID] = r.Count
	}
	return countMap
}

func BatchGetFavoriteStatus(articleIDs []uint, userID uint) map[uint]bool {
	if len(articleIDs) == 0 || userID == 0 {
		return make(map[uint]bool)
	}
	db := database.GetDB()
	var favorites []FavoriteModel
	db.Where("favorite_id IN ? AND favorite_by_id = ?", articleIDs, userID).Find(&favorites)
	statusMap := make(map[uint]bool)
	for _, f := range favorites {
		statusMap[f.FavoriteID] = true
	}
	return statusMap
}

func (article ArticleModel) favoriteBy(user ArticleUserModel) error {
	db := database.GetDB()
	var favorite FavoriteModel
	return db.FirstOrCreate(&favorite, &FavoriteModel{FavoriteID: article.ID, FavoriteByID: user.ID}).Error
}

func (article ArticleModel) unFavoriteBy(user ArticleUserModel) error {
	db := database.GetDB()
	return db.Where("favorite_id = ? AND favorite_by_id = ?", article.ID, user.ID).Delete(&FavoriteModel{}).Error
}

func SaveOne(data interface{}) error {
	db := database.GetDB()
	return db.Save(data).Error
}

func FindOneArticle(condition interface{}) (ArticleModel, error) {
	db := database.GetDB()
	var model ArticleModel
	err := db.Preload("Author.UserModel").Preload("Tags").Where(condition).First(&model).Error
	return model, err
}

func FindOneComment(condition *CommentModel) (CommentModel, error) {
	db := database.GetDB()
	var model CommentModel
	err := db.Preload("Author.UserModel").Preload("Article").Where(condition).First(&model).Error
	return model, err
}

func (self *ArticleModel) getComments() error {
	db := database.GetDB()
	return db.Preload("Author.UserModel").Model(self).Association("Comments").Find(&self.Comments)
}

func getAllTags() ([]TagModel, error) {
	db := database.GetDB()
	var models []TagModel
	err := db.Find(&models).Error
	return models, err
}

// FIXED: Transaction Poisoning isolated. We now apply status filters ONLY to Article queries.
func FindManyArticle(tag, author, limit, offset, favorited, q string, currentUserID uint) ([]ArticleModel, int, error) {
	db := database.GetDB()
	var models []ArticleModel
	var count int

	offset_int, _ := strconv.Atoi(offset)
	limit_int, errLimit := strconv.Atoi(limit)
	if errLimit != nil {
		limit_int = 20
	}

	statusQuery := "status = 'published'"
	var statusArgs []interface{}
	if currentUserID != 0 {
		statusQuery = "status = 'published' OR author_id = ?"
		statusArgs = append(statusArgs, currentUserID)
	}

	ftsQuery := ""
	if q != "" {
		ftsQuery = strings.ReplaceAll(strings.TrimSpace(q), " ", " & ")
	}

	applyFilters := func(query *gorm.DB) *gorm.DB {
		q := query.Where(statusQuery, statusArgs...)
		if ftsQuery != "" {
			q = q.Where("search_vector @@ to_tsquery('english', ?)", ftsQuery)
		}
		return q
	}

	if tag != "" {
		var tagModel TagModel
		db.Where(TagModel{Tag: tag}).First(&tagModel)
		if tagModel.ID != 0 {
			qdb := applyFilters(db.Model(&ArticleModel{}).Joins("JOIN article_tags ON article_tags.article_model_id = article_models.id").Where("article_tags.tag_model_id = ?", tagModel.ID))
			var count64 int64
			qdb.Count(&count64)
			count = int(count64)
			qdb.Offset(offset_int).Limit(limit_int).Preload("Author.UserModel").Preload("Tags").Order("updated_at desc").Find(&models)
		}
	} else if author != "" {
		var userModel auth.UserModel
		db.Where(auth.UserModel{Username: author}).First(&userModel)
		articleUserModel := GetArticleUserModel(userModel)
		if articleUserModel.ID != 0 {
			qdb := applyFilters(db.Model(&ArticleModel{}).Where("author_id = ?", articleUserModel.ID))
			var count64 int64
			qdb.Count(&count64)
			count = int(count64)
			qdb.Offset(offset_int).Limit(limit_int).Preload("Author.UserModel").Preload("Tags").Order("updated_at desc").Find(&models)
		}
	} else if favorited != "" {
		var userModel auth.UserModel
		db.Where(auth.UserModel{Username: favorited}).First(&userModel)
		articleUserModel := GetArticleUserModel(userModel)
		if articleUserModel.ID != 0 {
			qdb := applyFilters(db.Model(&ArticleModel{}).Joins("JOIN favorite_models ON favorite_models.favorite_id = article_models.id").Where("favorite_models.favorite_by_id = ?", articleUserModel.ID))
			var count64 int64
			qdb.Count(&count64)
			count = int(count64)
			qdb.Offset(offset_int).Limit(limit_int).Preload("Author.UserModel").Preload("Tags").Order("updated_at desc").Find(&models)
		}
	} else {
		qdb := applyFilters(db.Model(&ArticleModel{}))
		var count64 int64
		qdb.Count(&count64)
		count = int(count64)
		qdb.Offset(offset_int).Limit(limit_int).Preload("Author.UserModel").Preload("Tags").Order("updated_at desc").Find(&models)
	}

	return models, count, nil
}

// FIXED: Clean database queries without poisoned status checks
func (self *ArticleUserModel) GetArticleFeed(limit, offset string) ([]ArticleModel, int, error) {
	db := database.GetDB()
	models := make([]ArticleModel, 0)
	var count int

	offset_int, _ := strconv.Atoi(offset)
	limit_int, errLimit := strconv.Atoi(limit)
	if errLimit != nil {
		limit_int = 20
	}

	followings := self.UserModel.GetFollowings()
	if len(followings) > 0 {
		var followingUserIDs []uint
		for _, following := range followings {
			followingUserIDs = append(followingUserIDs, following.ID)
		}

		var articleUserModels []ArticleUserModel
		db.Where("user_model_id IN ?", followingUserIDs).Find(&articleUserModels)

		var authorIDs []uint
		for _, aum := range articleUserModels {
			authorIDs = append(authorIDs, aum.ID)
		}

		if len(authorIDs) > 0 {
			var count64 int64
			db.Model(&ArticleModel{}).Where("status = 'published' AND author_id IN ?", authorIDs).Count(&count64)
			count = int(count64)
			db.Preload("Author.UserModel").Preload("Tags").Where("status = 'published' AND author_id IN ?", authorIDs).Order("updated_at desc").Offset(offset_int).Limit(limit_int).Find(&models)
		}
	}
	return models, count, nil
}

func (model *ArticleModel) setTags(tags []string) error {
	if len(tags) == 0 {
		model.Tags = []TagModel{}
		return nil
	}
	db := database.GetDB()
	var existingTags []TagModel
	db.Where("tag IN ?", tags).Find(&existingTags)

	existingTagMap := make(map[string]TagModel)
	for _, t := range existingTags {
		existingTagMap[t.Tag] = t
	}

	var tagList []TagModel
	for _, tag := range tags {
		if existing, ok := existingTagMap[tag]; ok {
			tagList = append(tagList, existing)
		} else {
			newTag := TagModel{Tag: tag}
			if err := db.Create(&newTag).Error; err != nil {
				var existing TagModel
				if err2 := db.Where("tag = ?", tag).First(&existing).Error; err2 == nil {
					tagList = append(tagList, existing)
					continue
				}
				return err
			}
			tagList = append(tagList, newTag)
		}
	}
	model.Tags = tagList
	return nil
}

// FIXED: Explicitly force GORM to save Tags via Replace
func (model *ArticleModel) Update(data interface{}) error {
	db := database.GetDB()
	err := db.Model(model).Updates(data).Error
	if err != nil {
		return err
	}

	if articleData, ok := data.(ArticleModel); ok {
		err = db.Model(model).Association("Tags").Replace(articleData.Tags)
	}
	return err
}

func DeleteArticleModel(condition interface{}) error {
	db := database.GetDB()
	return db.Where(condition).Delete(&ArticleModel{}).Error
}

func DeleteCommentModel(condition interface{}) error {
	db := database.GetDB()
	return db.Where(condition).Delete(&CommentModel{}).Error
}

func (article *ArticleModel) BeforeSave(tx *gorm.DB) (err error) {
	wordCount := len(strings.Fields(article.Body))
	article.ReadTime = uint(math.Ceil(float64(wordCount) / 200.0))
	return nil
}

func (article *ArticleModel) BeforeUpdate(tx *gorm.DB) (err error) {
	if tx.Statement.Changed("Slug") {
		var old ArticleModel
		if err := tx.Session(&gorm.Session{NewDB: true}).First(&old, article.ID).Error; err == nil {
			if old.Slug != "" && old.Slug != article.Slug {
				tx.Create(&SlugHistory{ArticleID: article.ID, PreviousSlug: old.Slug})
			}
		}
	}

	if tx.Statement.Changed("Title") || tx.Statement.Changed("Body") || tx.Statement.Changed("Description") {
		var old ArticleModel
		if err := tx.Session(&gorm.Session{NewDB: true}).First(&old, article.ID).Error; err == nil {
			tx.Create(&ArticleVersion{
				ArticleID:   article.ID,
				Title:       old.Title,
				Description: old.Description,
				Body:        old.Body,
				Snapshot:    "Revision snapshot",
			})
		}
	}
	return nil
}
