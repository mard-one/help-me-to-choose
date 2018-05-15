"use strict";
var selectionAlgorithm = function (inputData, outputFn) {
    var rawData = [];
    var dataResult = [];
    inputData.map(function (priority) {
        console.log('priority', priority);
        // setting priorities
        return priority.rankGroup.map(function (rank) {
            rawData.push({
                name: rank.name,
                rank: rank.rank + (priority.priority - 1)
            });
        });
    });
    // removing duplicates by adding ranks of them
    dataResult = rawData.reduce(function (hash) {
        return function (r, a) {
            var key = a.name;
            if (!hash[key]) {
                hash[key] = { totalRank: 0, name: a.name };
                r.push(hash[key]);
            }
            hash[key].totalRank = hash[key].totalRank + a.rank;
            return r;
        };
        // tslint:disable-next-line:no-null-keyword
    }(Object.create(null)), []);
    // quicksort algorithm
    function quickSort(dataResult, left, right) {
        var len = dataResult.length;
        var pivot, partitionIndex;
        if (left < right) {
            pivot = right;
            partitionIndex = partition(dataResult, pivot, left, right);
            // sort left and right
            quickSort(dataResult, left, partitionIndex - 1);
            quickSort(dataResult, partitionIndex + 1, right);
        }
        return dataResult;
    }
    function partition(dataResult, pivot, left, right) {
        var pivotValue = dataResult[pivot].totalRank;
        var partitionIndex = left;
        for (var i = left; i < right; i++) {
            if (dataResult[i].totalRank < pivotValue) {
                swap(dataResult, i, partitionIndex);
                partitionIndex++;
            }
        }
        swap(dataResult, right, partitionIndex);
        return partitionIndex;
    }
    function swap(dataResult, i, j) {
        _a = [dataResult[j], dataResult[i]], dataResult[i] = _a[0], dataResult[j] = _a[1];
        var _a;
    }
    dataResult = quickSort(dataResult, 0, (dataResult.length - 1));
    console.log('data result', dataResult);
    outputFn(dataResult);
};
module.exports = selectionAlgorithm;
