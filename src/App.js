import React from 'react';
import './App.css';
import Fields from './fields.json';
import Data from './expense-account.json';

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

function parse(data) {
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

function mockRequest() {
  return new Promise(resolve => {
    setTimeout(resolve, 1000, Data);
  })
}


async function getResults() {
  const { data, success } = await mockRequest();
  if (success) {
    return parse(data);
  }
  return null
}

class Left extends React.Component {
  render() {
    const {data, selectedIndex, onSelect} = this.props;
    return (
      <div className='left-part'>
        <div className='top-list'>
          {data.map((d, index) => (
            <div className={'image-wrapper' + (selectedIndex === index ? ' selected' : '')} onClick={() => onSelect(index)}>
              <span style={{ color: 'grey' }}>{index+1}</span>
              {d['fileType'] === 'pdf' ? (
                <img src={require('./pdficon.png')} />
              ) : (
                <img src={d.previewUrl} />
              )}
              <div className='price'>
                ¥{d.jshjSum}
              </div>
            </div>
          ))}
        </div>
        <div className='bottom-sum'>
          <div className='title'>
            <img src={require("./ic_resume.png")} />
            <span>合计</span>
          </div>
          <div className="price-item-wrapper">
            <div className='price-item'>
              <div className='price-title'>
                合计(元)
              </div>
              <div className='price-value'>
                ¥ {data.reduce((p, c) => parseFloat(c.jshjSum) + p, 0).toFixed(2)}
              </div>
            </div>
            <div className='price-item'>
              <div className='price-title'>
                税额(元)
              </div>
              <div className='price-value'>
                ¥ {data.reduce((p, c) => parseFloat(c.seSum) + p, 0).toFixed(2)}
              </div>
            </div>
            <div className='price-item'>
              <div className='price-title'>
                发票张数
              </div>
              <div className='price-value'>
                {data.reduce((p, c) => p+c.body.length, 0)}
              </div>
            </div>
            {/* <div className='price-item'>
              <div className='price-title'>
                合计(元)
              </div>
              <div className='price-value'>
                ¥1234
              </div>
            </div> */}
          </div>
        </div>
      </div>
    )
  }
}

class RightList extends React.Component {
  render() {
    const {list} = this.props;
    return (
      <div className='list-container'>
        <div style={{fontWeight: 'bold', marginBottom: 5}}>发票列表</div>
        {list.map((item, index) => (
          <div className='list-item-container'>
            <div className='numbeer'>
              {index+1}
            </div>
            {item.displayKV.slice(0, 10).map(({keyDisplayName, value}) => (
              <div style={{color: '#444444', marginTop: 2}}>
                <span style={{marginRight: 8}}>{keyDisplayName}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }
}

class Detail extends React.Component {
  render() {
    const {data, selectedImagePartIndex, handleCloseDetail} = this.props;
    if (isNaN(selectedImagePartIndex)) {
      return (
        <div className='list-container'>
          <div className='title-wrapper'>
            <div style={{fontWeight: 'bold', marginBottom: 5}}>发票详情</div>
          </div>
          <div className='list-item-container'>
            <div className='numbeer'>
              1
            </div>
            {data.map(({keyDisplayName, value}) => (
              <div style={{color: '#444444', marginTop: 2}}>
                <span style={{marginRight: 8}}>{keyDisplayName}:</span>
                <span>{typeof(value) === 'string' ? value : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return (
      <div className='list-container'>
        <div className='title-wrapper'>
          <div style={{fontWeight: 'bold', marginBottom: 5}}>发票详情</div>
          <div className='close-btn' onClick={handleCloseDetail}>关闭</div>
        </div>
        <div className='list-item-container'>
          <div className='numbeer'>
            {selectedImagePartIndex+1}
          </div>
          {data.displayKV.map(({keyDisplayName, value}) => (
            <div style={{color: '#444444', marginTop: 2}}>
              <span style={{marginRight: 8}}>{keyDisplayName}:</span>
              <span>{typeof(value) === 'string' ? value : ''}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

class HotArea extends React.Component {
  render() {
    const { index, coordinate, ratio, onClick, isSelected } = this.props;
    console.log(coordinate)
    const left = (coordinate.startX)/ratio;
    const top = (coordinate.startY)/ratio;
    const width = (coordinate.endX - left)/ratio;
    const height = (coordinate.endY - top)/ratio;
    return (
      <div
        className={'image-hot-area' + (isSelected ? ' selected-hot-area' : '')}
        style={{ left, top, width, height }}
        onClick={() => onClick(index)}
      >
        <div className='number'>
          {index+1}
        </div>
      </div>
    )
  }
}

class Image extends React.Component {
  state = {
    imageHeight: 1,
    imageWidth: 1,
    divHeight: 1,
    divWidth: 1,
    isImageLandscapeMode: false,
  }
  componentDidMount() {
    const divWidth = this.divElement.clientWidth;
    const divHeight = this.divElement.clientHeight;
    this.setState({ divWidth, divHeight })
  }
  onImgLoad = ({ target: img }) => {
    this.setState({
      imageWidth: img.naturalWidth,
      imageHeight: img.naturalHeight,
      imageRatio: img.naturalWidth / img.naturalHeight,
      isImageLandscapeMode: img.naturalWidth > img.naturalHeight
    });
  }
  render() {
    const { imageUrl, data, onClickImagePart, selectedImagePartIndex } = this.props;
    const { isImageLandscapeMode, divHeight, divWidth, imageRatio, imageWidth, imageHeight } = this.state;
    return (
      <div className='image-part' ref={divElement => this.divElement = divElement}>
        <div className='big-img-wrapper' style={{
          width: isImageLandscapeMode ? divWidth : divWidth/imageRatio,
          height: isImageLandscapeMode ? divHeight/imageRatio : divHeight,
          left: isImageLandscapeMode ? 0 : '50%',
          top: isImageLandscapeMode ? '50%' : 0,
          transform: isImageLandscapeMode ? 'translateY(-50%)' : 'translateX(-50%)',
          position: 'relative',
        }}>
          <img onLoad={this.onImgLoad} src={imageUrl} style={{
            width: '100%',
            height: '100%'
          }} />
          {data.map((item, index) => (
            <HotArea
              index={index}
              coordinate={item.coordinate}
              onClick={index => onClickImagePart(index)}
              isSelected={selectedImagePartIndex === index}
              ratio={isImageLandscapeMode ? imageWidth/divWidth : imageHeight/divHeight}
            />
          ))}
        </div>
      </div>
    )
  }
}

class Main extends React.Component {
  state = {
    selectedImagePartIndex: -1
  }
  render() {
    const {data, type, previewUrl} = this.props;
    if (type === 'other') {
      return (
        <div>
          文件格式不支持
        </div>
      )
    }
    if (type === 'image') {
      const {selectedImagePartIndex} = this.state;
      // const coordinates = data.length > 0 ? data.map(item => ({
      //   ...item.coordinate
      // })) : [];
      // const list = data.length > 0 ? data.map(item => item.data) : [];
      return (
        <div className='main-part'>
          <Image
            imageUrl={previewUrl}
            data={data.body}
            selectedImagePartIndex={selectedImagePartIndex}
            onClickImagePart={index => this.setState({ selectedImagePartIndex: index })}
          />
          <div className='right-part'>
            {selectedImagePartIndex >= 0 ? (
                <Detail
                  data={data['body'][selectedImagePartIndex]}
                  selectedImagePartIndex={selectedImagePartIndex}
                  handleCloseDetail={() => this.setState({ selectedImagePartIndex: -1 })}
                />
              ) : (
                <RightList list={data['body']} />
            )}
          </div>
        </div>
      )
    }
    if (type === 'pdf') {
      return (
        <div className='main-part'>
          <embed
            src={previewUrl}
            type="application/pdf"
          />
          <div className='right-part'>
            <Detail data={data['body'][0]['displayKV']} />
          </div>
        </div>
      )
    }
  }
}

export default class App extends React.Component {
  state = {
    data: [],
    selectedIndex: 0,
  }
  async componentDidMount() {
    const data = await getResults();
    this.setState({ data });
  }
  render() {
    const {data, selectedIndex} = this.state;
    return (
      <div className='app-container'>
        <Left
          data={data}
          selectedIndex={selectedIndex}
          onSelect={selectedIndex => this.setState({ selectedIndex })}
        />
        {data.length > 0 && (
          <Main
            data={data[selectedIndex]}
            type={data[selectedIndex]['fileType']}
            previewUrl={data[selectedIndex]['previewUrl']}
          />
        )}
      </div>
    )
  }
}
