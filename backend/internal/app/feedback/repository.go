package feedback

import (
	"context"
	"fmt"
	"prompt-analyzer/internal/entity"
	"prompt-analyzer/internal/platform/pagination"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	m *mongo.Database
}

func NewRepository(m *mongo.Database) *Repository {
	return &Repository{m: m}
}

func (r *Repository) Save(ctx context.Context, feedback entity.Feedback) error {
	c := r.m.Collection("feedback")
	_, err := c.InsertOne(ctx, feedback)
	if err != nil {
		return fmt.Errorf("cannot insert feedback document")
	}
	return nil
}

func (r *Repository) GetAllFiltered(ctx context.Context, f Filter) ([]FeedbackGrouped, int, error) {
	param := bson.M{}
	if !f.From.IsZero() {
		param["createdAt"] = bson.M{"$gte": f.From}
	}
	if !f.To.IsZero() {
		if param["createdAt"] != nil {
			param["createdAt"] = bson.M{"$gte": f.From, "$lte": f.To}
		} else {
			param["createdAt"] = bson.M{"$lte": f.To}
		}
	}

	if f.GroupName != "" {
		param["groupName"] = f.GroupName
	}
	if f.PubVersion != "" {
		param["publicationVersion"] = f.PubVersion
	}

	page, limit := pagination.GetPaginationParams(ctx)
	aggr := bson.A{
		bson.D{{Key: "$match", Value: param}},
		bson.D{
			{"$group",
				bson.D{
					{"_id",
						bson.D{
							{"groupName", "$groupName"},
							{"publicationVersion", "$publicationVersion"},
						},
					},
					{"all", bson.D{{"$count", bson.D{}}}},
					{"allGroup",
						bson.D{
							{"$sum",
								bson.D{
									{"$cond",
										bson.A{
											bson.D{
												{"$eq",
													bson.A{
														"$type",
														"GROUP",
													},
												},
											},
											1,
											0,
										},
									},
								},
							},
						},
					},
					{"positive",
						bson.D{
							{"$sum",
								bson.D{
									{"$cond",
										bson.A{
											"$positive",
											1,
											0,
										},
									},
								},
							},
						},
					},
					{"positiveGroup",
						bson.D{
							{"$sum",
								bson.D{
									{"$cond",
										bson.A{
											bson.D{
												{"$and",
													bson.A{
														"$positive",
														bson.D{
															{"$eq",
																bson.A{
																	"$type",
																	"GROUP",
																},
															},
														},
													},
												},
											},
											1,
											0,
										},
									},
								},
							},
						},
					},
					{"firstCreatedAt", bson.D{{"$first", "$createdAt"}}},
					{"lastCreatedAt", bson.D{{"$last", "$createdAt"}}},
					{"groupName", bson.D{{"$first", "$groupName"}}},
					{"publicationVersion", bson.D{{"$first", "$publicationVersion"}}},
				},
			},
		},
		bson.D{
			{"$project",
				bson.D{
					{"possitivePercAll",
						bson.D{
							{"$multiply",
								bson.A{
									bson.D{
										{"$divide",
											bson.A{
												"$positive",
												bson.D{
													{"$cond",
														bson.A{
															bson.D{
																{"$gt",
																	bson.A{
																		"$all",
																		0,
																	},
																},
															},
															"$all",
															1,
														},
													},
												},
											},
										},
									},
									100,
								},
							},
						},
					},
					{"possitivePercGroup",
						bson.D{
							{"$multiply",
								bson.A{
									bson.D{
										{"$divide",
											bson.A{
												"$positiveGroup",
												bson.D{
													{"$cond",
														bson.A{
															bson.D{
																{"$gt",
																	bson.A{
																		"$allGroup",
																		0,
																	},
																},
															},
															"$allGroup",
															1,
														},
													},
												},
											},
										},
									},
									100,
								},
							},
						},
					},
					{"publicationVersion", 1},
					{"groupName", 1},
					{"firstCreatedAt", 1},
					{"lastCreatedAt", 1},
					{"all", 1},
					{"allGroup", 1},
				},
			},
		},
	}
	rAgg := append(aggr, bson.D{{Key: "$skip", Value: (page - 1) * limit}}, bson.D{{Key: "$limit", Value: limit}})
	c := r.m.Collection("feedback")
	cur, err := c.Aggregate(ctx, rAgg)
	if err != nil {
		return nil, 0, fmt.Errorf("cannot fetch grouped analyzed docs, err: %v", err)
	}
	defer cur.Close(ctx)

	res := make([]FeedbackGrouped, 0)
	for cur.Next(ctx) {
		var result FeedbackGrouped
		err := cur.Decode(&result)
		if err != nil {
			return nil, 0, fmt.Errorf("cannot parse prompt root, err: %v", err)
		}
		res = append(res, result)
	}

	if err := cur.Err(); err != nil {
		return nil, 0, fmt.Errorf("prompt cursor error, err: %v", err)
	}

	agg := append(rAgg, bson.D{{Key: "$count", Value: "total"}})
	cur, err = c.Aggregate(ctx, agg)
	if err != nil {
		return nil, 0, fmt.Errorf("cannot fetch grouped analyzed docs count, err: %v", err)
	}
	defer cur.Close(ctx)

	type countTotal struct {
		Total int `bson:"total" json:"total"`
	}
	var results []countTotal
	if err = cur.All(ctx, &results); err != nil {
		return nil, 0, fmt.Errorf("cannot parse count total, err: %v", err)
	}
	if len(results) == 0 {
		return res, 0, nil
	}
	return res, results[0].Total, nil
}

func (r *Repository) GetSubFeedback(ctx context.Context, gID, pID string) ([]FeedbackSubGrouped, error) {
	param := bson.M{}
	if gID != "" {
		param["groupName"] = gID
	}
	if pID != "" {
		param["publicationVersion"] = pID
	}
	param["type"] = "PROMPT"
	rAgg := bson.A{
		bson.D{{Key: "$match", Value: param}},
		bson.D{
			{"$group",
				bson.D{
					{"_id",
						bson.D{
							{"groupName", "$groupName"},
							{"publicationVersion", "$publicationVersion"},
							{"objectId", "$objectId"},
						},
					},
					{"all", bson.D{{"$count", bson.D{}}}},
					{"positive",
						bson.D{
							{"$sum",
								bson.D{
									{"$cond",
										bson.A{
											"$positive",
											1,
											0,
										},
									},
								},
							},
						},
					},
					{"firstCreatedAt", bson.D{{"$first", "$createdAt"}}},
					{"lastCreatedAt", bson.D{{"$last", "$createdAt"}}},
					{"objectId", bson.D{{"$first", "$objectId"}}},
				},
			},
		},
		bson.D{
			{"$project",
				bson.D{
					{"possitivePercAll",
						bson.D{
							{"$multiply",
								bson.A{
									bson.D{
										{"$divide",
											bson.A{
												"$positive",
												bson.D{
													{"$cond",
														bson.A{
															bson.D{
																{"$gt",
																	bson.A{
																		"$all",
																		0,
																	},
																},
															},
															"$all",
															1,
														},
													},
												},
											},
										},
									},
									100,
								},
							},
						},
					},
					{"objectId", 1},
					{"firstCreatedAt", 1},
					{"lastCreatedAt", 1},
					{"all", 1},
				},
			},
		},
	}
	c := r.m.Collection("feedback")
	cur, err := c.Aggregate(ctx, rAgg)
	if err != nil {
		return nil, fmt.Errorf("cannot fetch grouped analyzed docs, err: %v", err)
	}
	defer cur.Close(ctx)

	res := make([]FeedbackSubGrouped, 0)
	for cur.Next(ctx) {
		var result FeedbackSubGrouped
		err := cur.Decode(&result)
		if err != nil {
			return nil, fmt.Errorf("cannot parse prompt root, err: %v", err)
		}
		res = append(res, result)
	}

	if err := cur.Err(); err != nil {
		return nil, fmt.Errorf("prompt cursor error, err: %v", err)
	}
	return res, nil
}

func (r *Repository) GetDistinctFilterOptions(ctx context.Context, filters string) ([]string, error) {
	c := r.m.Collection("feedback")
	cur, err := c.Distinct(ctx, filters, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("cannot get distinct filter options, err: %v", err)
	}
	var res []string
	for _, dv := range cur {
		res = append(res, dv.(string))
	}
	return res, nil
}
