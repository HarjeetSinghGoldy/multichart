import {
    Meteor
} from 'meteor/meteor';

LooksAnalytics = new Mongo.Collection("looks_analytics");
ProductType = new Mongo.Collection("product_type");
LookType = new Mongo.Collection("look_type");

console.log("********hellooo");
Meteor.methods({
    getData: function() {

        var productTypeArr = ProductType.find({}, {
            title: 1
        }).fetch().map(function(i, v) {
            return i.title
        });

        console.log(productTypeArr);
        var looksTypeArr = LookType.find({}, {
            title: 1
        }).fetch().map(function(i, v) {
            return i.title
        });

console.log(looksTypeArr);
        var totalArr = productTypeArr.concat(looksTypeArr);

        var facet = {};

        for (var typeTitle of looksTypeArr) {
            facet[typeTitle] = [];
            facet[typeTitle].push({
                $match: {
                    [typeTitle]: {
                        $exists: 1
                    },
                    created_date: {
                        $exists: 1
                    }
                }
            });
            facet[typeTitle].push({
                $addFields: {
                    both_hour_visits: "$" + typeTitle + ".both_hour_visits"
                }
            });
            facet[typeTitle].push({
                $project: {
                    _id: 0,
                    created_date: 1,
                    both_hour_visits: 1
                }
            });
        }

        var result = LooksAnalytics.aggregate([{
            $match: {
                _id: {
                    $regex: /^ProductAndLookTypeVisitCount/
                }
            }
        }, {
            $facet: facet
        }]);


return result;
    }
});
