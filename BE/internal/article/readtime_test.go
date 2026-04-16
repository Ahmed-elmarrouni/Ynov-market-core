package article

import (
	"strings"
	"testing"
	"gorm.io/gorm"

	"github.com/stretchr/testify/assert"
)

func TestArticleModel_ReadTime_BeforeSave(t *testing.T) {
	assert := assert.New(t)

	// Helper func to generate dummy words
	generateWords := func(count int) string {
		return strings.Repeat("word ", count)
	}

	tests := []struct {
		name          string
		wordCount     int
		expectedMins  uint
	}{
		{
			name:         "Empty body equals 0 read time",
			wordCount:    0,
			expectedMins: 0,
		},
		{
			name:         "Short 100 words equals 1 minute read time",
			wordCount:    100,
			expectedMins: 1,
		},
		{
			name:         "Exactly 200 words equals 1 minute read time",
			wordCount:    200,
			expectedMins: 1,
		},
		{
			name:         "Just over 200 words (201) rounds up to 2 minutes",
			wordCount:    201,
			expectedMins: 2,
		},
		{
			name:         "Large 1000 word article equals 5 minutes",
			wordCount:    1000,
			expectedMins: 5,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Init dummy article
			article := &ArticleModel{
				Body: generateWords(tt.wordCount),
			}

			// Trigger the gorm BeforeSave hook manually with a dummy transaction
			err := article.BeforeSave(&gorm.DB{})
			
			assert.NoError(err, "BeforeSave hook should not fail")
			assert.Equal(tt.expectedMins, article.ReadTime, "Expected read time %d minutes for %d words", tt.expectedMins, tt.wordCount)
		})
	}
}
