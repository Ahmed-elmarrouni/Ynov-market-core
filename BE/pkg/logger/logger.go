package logger

import (
	"log"

	"go.uber.org/zap"
)

var Log *zap.SugaredLogger

func Init() {
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("can't initialize zap logger: %v", err)
	}
	// defer logger.Sync() is handled by main.go conventionally
	
	Log = logger.Sugar()
}
