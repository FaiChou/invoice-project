import Fields from './fields.json';
import Data from './expense-account.json';
import parse from './parser';

export function request() {
  return new Promise(resolve => {
    setTimeout(resolve, 1000, Data);
  })
}

// export async function parseData(data) {
//   return data.map(item => ({
//     billType: item.billType,
//     coordinate: item.coordinate,
//     data: Object.keys(Fields[item.billType]).map(key => ({
//       keyName: key,
//       value: item.data[key],
//       keyDisplayName: Fields[item.billType][key]['name'],
//     }))
//   }))
// }

export async function getResults() {
  const { data, success } = await request();
  if (success) {
    return parse(data);
  }
  return null
}
