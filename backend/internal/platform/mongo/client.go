package mongo

import (
	"context"
	"fmt"
	"time"

	"github.com/kelseyhightower/envconfig"
	m "go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type mongoConfig struct {
	Host     string `required:"true"`
	Port     string `required:"true"`
	DBName   string `required:"true"`
	Username string `required:"true"`
	Password string `required:"true"`
}

func (c mongoConfig) getMongoURL() string {
	return fmt.Sprintf("mongodb://%s:%s@%s:%s/%s",
		c.Username, c.Password, c.Host, c.Port, c.DBName)
}

type Connection struct {
	client *m.Database
}

func NewConnection() *m.Database {
	var config mongoConfig
	envconfig.MustProcess("mongo", &config)
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	opts := options.Client().SetCompressors([]string{"snappy", "zlib", "zstd"})
	client, err := m.Connect(ctx, options.Client().ApplyURI(config.getMongoURL()), opts)
	if err != nil {
		panic(err)
	}
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		panic(err)
	}
	return client.Database(config.DBName)
}
