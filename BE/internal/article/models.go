package article

import (
	"math"
	"strings"

	"strconv"

	"github.com/gothinkster/golang-gin-realworld-example-app/pkg/database"
	"github.com/gothinkster/golang-gin-realworld-example-app/internal/auth"
	"gorm.io/gorm"
)

type ArticleModel struct {
	gorm.Model
	Slug        string `gorm:"uniqueIndex"`
	Title       string
	Description string
	Body        string
	Status      string `gorm:"default:'published'"` // we use published by default for backward compatibility
	ReadTime    uint
	Author      ArticleUserModel `gorm:"foreignKey:AuthorID"`
	AuthorID    uint
	Tags        []TagModel       `gorm:"many2many:article_tags;"`
	Comments    []CommentModel   `gorm:"foreignKey:ArticleID"`
	Versions    []ArticleVersion `gorm:"foreignKey:ArticleID"`
	SlugHistory []SlugHistory    `gorm:"foreignKey:ArticleID"`
}

type ArticleVersion struct {
	gorm.Model
	ArticleID    uint
	Title        string
	Description  string
	Body         string
	Snapshot     string
}

type SlugHistory struct {
	gorm.Model
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
	db.Where(&ArticleUserModel{
		UserModelID: userModel.ID,
	}).FirstOrCreate(&articleUserModel)
	articleUserModel.UserModel = userModel
	return articleUserModel
}

func (article ArticleModel) favoritesCount() uint {
	db := database.GetDB()
	var count int64
	db.Model(&FavoriteModel{}).Where(FavoriteModel{
		FavoriteID: article.ID,
	}).Count(&count)
	return uint(count)
}

func (article ArticleModel) isFavoriteBy(user ArticleUserModel) bool {
	db := database.GetDB()
	var favorite FavoriteModel
	db.Where(FavoriteModel{
		FavoriteID:   article.ID,
		FavoriteByID: user.ID,
	}).First(&favorite)
	return favorite.ID != 0
}

// BatchGetFavoriteCounts returns a map of article ID to favorite count
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
	db.Model(&FavoriteModel{}).
		Select("favorite_id, COUNT(*) as count").
		Where("favorite_id IN ?", articleIDs).
		Group("favorite_id").
		Find(&results)

	countMap := make(map[uint]uint)
	for _, r := range results {
		countMap[r.FavoriteID] = r.Count
	}
	return countMap
}

// BatchGetFavoriteStatus returns a map of article ID to whether the user favorited it
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
	err := db.FirstOrCreate(&favorite, &FavoriteModel{
		FavoriteID:   article.ID,
		FavoriteByID: user.ID,
	}).Error
	return err
}

func (article ArticleModel) unFavoriteBy(user ArticleUserModel) error {
	db := database.GetDB()
	err := db.Where("favorite_id = ? AND favorite_by_id = ?", article.ID, user.ID).Delete(&FavoriteModel{}).Error
	return err
}

func SaveOne(data interface{}) error {
	db := database.GetDB()
	err := db.Save(data).Error
	return err
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
	err := db.Preload("Author.UserModel").Model(self).Association("Comments").Find(&self.Comments)
	return err
}

func getAllTags() ([]TagModel, error) {
	db := database.GetDB()
	var models []TagModel
	err := db.Find(&models).Error
	return models, err
}

func FindManyArticle(tag, author, limit, offset, favorited, q string, currentUserID uint) ([]ArticleModel, int, error) {
	db := database.GetDB()
	var models []ArticleModel
	var count int

	offset_int, errOffset := strconv.Atoi(offset)
	if errOffset != nil {
		offset_int = 0
	}

	limit_int, errLimit := strconv.Atoi(limit)
	if errLimit != nil {
		limit_int = 20
	}

		tx := db.Begin()
	// Filter by published status or author
	if currentUserID == 0 {
		tx = tx.Where("status = 'published'")
	} else {
		tx = tx.Where("status = 'published' OR author_id = ?", currentUserID)
	}
	
	// FTS via postgres tsvector
	if q != "" {
	    // Safely structure FTS tsquery (simple mapping replacing spaces with &)
	    formattedQuery := strings.ReplaceAll(strings.TrimSpace(q), " ", " & ")
		tx = tx.Where("search_vector @@ to_tsquery('english', ?)", formattedQuery)
	}
	if tag != "" {
		var tagModel TagModel
		tx.Where(TagModel{Tag: tag}).First(&tagModel)
		if tagModel.ID != 0 {
			// Get article IDs via association
			var tempModels []ArticleModel
			if err := tx.Model(&tagModel).Offset(offset_int).Limit(limit_int).Association("ArticleModels").Find(&tempModels); err != nil {
				tx.Rollback()
				return models, count, err
			}
			count = int(tx.Model(&tagModel).Association("ArticleModels").Count())
			// Fetch articles with preloaded associations in single query, ordered by updated_at desc
			if len(tempModels) > 0 {
				var ids []uint
				for _, m := range tempModels {
					ids = append(ids, m.ID)
				}
				tx.Preload("Author.UserModel").Preload("Tags").Where("id IN ?", ids).Order("updated_at desc").Find(&models)
			}
		}
	} else if author != "" {
		var userModel auth.UserModel
		tx.Where(auth.UserModel{Username: author}).First(&userModel)
		articleUserModel := GetArticleUserModel(userModel)

		if articleUserModel.ID != 0 {
			count = int(tx.Model(&articleUserModel).Association("ArticleModels").Count())
			// Get article IDs via association
			var tempModels []ArticleModel
			if err := tx.Model(&articleUserModel).Offset(offset_int).Limit(limit_int).Association("ArticleModels").Find(&tempModels); err != nil {
				tx.Rollback()
				return models, count, err
			}
			// Fetch articles with preloaded associations in single query, ordered by updated_at desc
			if len(tempModels) > 0 {
				var ids []uint
				for _, m := range tempModels {
					ids = append(ids, m.ID)
				}
				tx.Preload("Author.UserModel").Preload("Tags").Where("id IN ?", ids).Order("updated_at desc").Find(&models)
			}
		}
	} else if favorited != "" {
		var userModel auth.UserModel
		tx.Where(auth.UserModel{Username: favorited}).First(&userModel)
		articleUserModel := GetArticleUserModel(userModel)
		if articleUserModel.ID != 0 {
			var favoriteModels []FavoriteModel
			tx.Where(FavoriteModel{
				FavoriteByID: articleUserModel.ID,
			}).Offset(offset_int).Limit(limit_int).Find(&favoriteModels)

			count = int(tx.Model(&articleUserModel).Association("FavoriteModels").Count())
			// Batch fetch articles to avoid N+1 query
			if len(favoriteModels) > 0 {
				var ids []uint
				for _, favorite := range favoriteModels {
					ids = append(ids, favorite.FavoriteID)
				}
				tx.Preload("Author.UserModel").Preload("Tags").Where("id IN ?", ids).Order("updated_at desc").Find(&models)
			}
		}
	} else {
		var count64 int64
		tx.Model(&ArticleModel{}).Count(&count64)
		count = int(count64)
		tx.Offset(offset_int).Limit(limit_int).Preload("Author.UserModel").Preload("Tags").Find(&models)
	}

	err := tx.Commit().Error
	return models, count, err
}

func (self *ArticleUserModel) GetArticleFeed(limit, offset string) ([]ArticleModel, int, error) {
	db := database.GetDB()
	models := make([]ArticleModel, 0)
	var count int

	offset_int, errOffset := strconv.Atoi(offset)
	if errOffset != nil {
		offset_int = 0
	}
	limit_int, errLimit := strconv.Atoi(limit)
	if errLimit != nil {
		limit_int = 20
	}

	tx := db.Begin()
	tx = tx.Where("status = 'published'")
	followings := self.UserModel.GetFollowings()

	// Batch get ArticleUserModel IDs to avoid N+1 query
	if len(followings) > 0 {
		var followingUserIDs []uint
		for _, following := range followings {
			followingUserIDs = append(followingUserIDs, following.ID)
		}

		var articleUserModels []ArticleUserModel
		tx.Where("user_model_id IN ?", followingUserIDs).Find(&articleUserModels)

		var authorIDs []uint
		for _, aum := range articleUserModels {
			authorIDs = append(authorIDs, aum.ID)
		}

		if len(authorIDs) > 0 {
			var count64 int64
			tx.Model(&ArticleModel{}).Where("author_id IN ?", authorIDs).Count(&count64)
			count = int(count64)
			tx.Preload("Author.UserModel").Preload("Tags").Where("author_id IN ?", authorIDs).Order("updated_at desc").Offset(offset_int).Limit(limit_int).Find(&models)
		}
	}

	err := tx.Commit().Error
	return models, count, err
}

func (model *ArticleModel) setTags(tags []string) error {
	if len(tags) == 0 {
		model.Tags = []TagModel{}
		return nil
	}

	db := database.GetDB()

	// Batch fetch existing tags
	var existingTags []TagModel
	db.Where("tag IN ?", tags).Find(&existingTags)

	// Create a map for quick lookup
	existingTagMap := make(map[string]TagModel)
	for _, t := range existingTags {
		existingTagMap[t.Tag] = t
	}

	// Create missing tags and build final list
	var tagList []TagModel
	for _, tag := range tags {
		if existing, ok := existingTagMap[tag]; ok {
			tagList = append(tagList, existing)
		} else {
			// Create new tag with race condition handling
			newTag := TagModel{Tag: tag}
			if err := db.Create(&newTag).Error; err != nil {
				// If creation failed (e.g., concurrent insert), try to fetch existing
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

func (model *ArticleModel) Update(data interface{}) error {
	db := database.GetDB()
	err := db.Model(model).Updates(data).Error
	return err
}

func DeleteArticleModel(condition interface{}) error {
	db := database.GetDB()
	err := db.Where(condition).Delete(&ArticleModel{}).Error
	return err
}

func DeleteCommentModel(condition interface{}) error {
	db := database.GetDB()
	err := db.Where(condition).Delete(&CommentModel{}).Error
	return err
}




func (article *ArticleModel) BeforeSave(tx *gorm.DB) (err error) {
	// Simple standard 200 WPM formula for Read Time
	wordCount := len(strings.Fields(article.Body))
	article.ReadTime = uint(math.Ceil(float64(wordCount) / 200.0))
	return nil
}

func (article *ArticleModel) BeforeUpdate(tx *gorm.DB) (err error) {
	// If the article is being updated, log the previous version snapshot
	// To do this, we need to query the original state if we're dealing with an existing row
	if tx.Statement.Changed("Slug") {
		var old ArticleModel
		if err := tx.Session(&gorm.Session{NewDB: true}).First(&old, article.ID).Error; err == nil {
			if old.Slug != "" && old.Slug != article.Slug {
				// Record the old slug for 301 history
				tx.Create(&SlugHistory{
					ArticleID:    article.ID,
					PreviousSlug: old.Slug,
				})
			}
		}
	}

	// Always save a version if body or description changed
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
