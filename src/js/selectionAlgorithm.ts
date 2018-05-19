interface InputData {
  priority: number;
  name: string;
  rankGroup: [{
    rank: number;
    name: string;
  }];
}
interface OutputData {
  totalRank: number;
  name: string;
}
interface RawData {
  rank: number;
  name: string;
}
const selectionAlgorithm = function(inputData: InputData[], outputFn: OutputData[]) {
  const rawData: RawData[] = [];
  let dataResult: OutputData[] = [];
  inputData.map(priority => {
    console.log('priority', priority);
    // setting priorities
    return priority.rankGroup.map(rank => {
      rawData.push({
        name: rank.name,
        rank: rank.rank + (priority.priority - 1)
      });
    });
  });
  // removing duplicates by adding ranks of them
  dataResult = rawData.reduce(function(hash) {
    return function(r: any, a: any) {
      const key = a.name;
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
  function quickSort(dataResult: any, left: any, right: any) {
    let pivot, partitionIndex;
    if (left < right) {
      pivot = right;
      partitionIndex = partition(dataResult, pivot, left, right);

      // sort left and right
      quickSort(dataResult, left, partitionIndex - 1);
      quickSort(dataResult, partitionIndex + 1, right);
    }
    return dataResult;
  }
  function partition(dataResult: any, pivot: any, left: any, right: any) {
    const pivotValue = dataResult[pivot].totalRank;
    let partitionIndex = left;

    for (let i = left; i < right; i++) {
      if (dataResult[i].totalRank < pivotValue) {
        swap(dataResult, i, partitionIndex);
        partitionIndex++;
      }
    }
    swap(dataResult, right, partitionIndex);
    return partitionIndex;
  }
  function swap(dataResult: any, i: any, j: any) {
    [dataResult[i], dataResult[j]] = [dataResult[j], dataResult[i]];
  }
  dataResult = quickSort(dataResult, 0, (dataResult.length - 1));
  console.log('data result', dataResult);
  outputFn(dataResult);
};
export = selectionAlgorithm;
