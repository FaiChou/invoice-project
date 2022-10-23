import Fields from './fields.json';

/**
 * from:
 * data: {
     "10013A100000005B5H38": {
       attachInfo: {
         filetype: 'pdf', // pdf image other
         previewUrl: 'http://xxx.xx/xx.pdf',
       },
       aggErmInvoice: [
        {
          m_headVo: {
            ...
            defitem2: "40-20-40-120", // startx starty endx endy
            jshj: "23.72", // 价税合计
            hjje: "20.99", // 合计金额
            se: "" // = 价税合计 - 合计金额
          }
        }
       ]
     }
 * }
 */

/**
 * to:
   [
    {
      id: '10013A100000005B5H38',
      fileType: 'pdf', // 类型: pdf image other 
      previewUrl: 'http://xxx.xx/xx.pdf', // 预览 url
      jshjSum: 2222, // 价税合计 sum
      seSum: 222, // 税额 sum
      body: [
        {
          ...m_headVo,
          startX: 1,
          startY: 2,
          endX: 3,
          endY: 4,
        }
      ]
    }
   ]
 */

export default function parse(data) {
  return Object.keys(data).map(key => {
    const body = data[key]["aggErmInvoice"].map(i => {
      const coordinate = i["m_headVo"]["defitem2"] || '0-0-0-0';
      const coordinateParsed = coordinate.split('-');
      const newFields = [...Object.keys(Fields).map(x => ({
        ...Fields[x],
        key: x,
      }))];
      newFields.sort((a, b) => a.order - b.order);
      return {
        ...i["m_headVo"],
        displayKV: newFields.map(ii => ({
          keyName: ii.key,
          value: i["m_headVo"][ii.key],
          keyDisplayName: ii['name'],
        })),
        coordinate: {
          startX: coordinateParsed[0],
          startY: coordinateParsed[1],
            endX: coordinateParsed[2],
            endY: coordinateParsed[3],
        }
      }
    });
    const jshjSum = body.reduce((p, c) => p + parseFloat(c["jshj"]), 0);
    const hjjeSum = body.reduce((p, c) => p + parseFloat(c["hjje"]), 0);
    return {
      id: key,
      body,
      jshjSum,
      seSum: jshjSum-hjjeSum,
      fileType: data[key]["attachInfo"]["filetype"],
      previewUrl: data[key]["attachInfo"]["previewUrl"],
    }
  })
}