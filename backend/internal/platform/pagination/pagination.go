package pagination

import (
	"context"
	"strconv"
)

type key string

func GetPaginationParams(ctx context.Context) (int64, int64) {
	page := ctx.Value(key("page")).(int64)
	limit := ctx.Value(key("limit")).(int64)
	return page, limit
}

func SetPaginationParams(ctx context.Context, page string, limit string) context.Context {
	p, err := strconv.ParseInt(page, 10, 64)
	if err != nil || p < 0 {
		p = 1
	}
	l, err := strconv.ParseInt(limit, 10, 64)
	if err != nil || l < 0 {
		p = 0
	}
	ctx = context.WithValue(ctx, key("page"), p)
	return context.WithValue(ctx, key("limit"), l)
}
