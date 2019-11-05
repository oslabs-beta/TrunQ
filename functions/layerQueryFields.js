const layerQueryFields = (query, uniques = [], limits = []) => {

    let temp = '';
    let cacheObj = {};
    const globalCacheArr = []
    let level = -1;
    let whiteSpaceBeforeParenRegex = /(?<=[\w]) (?=\()/;
  
    for (let i = 0; i < query.length; i += 1) {
        if (query[i] === '{') {
            level += 1;
            temp = temp.replace(/[\n]/g, '').trim();
            temp = temp.replace(/[\s]+/g, ' ');
            temp = temp.replace(whiteSpaceBeforeParenRegex, '');
  
            if (temp !== "") {
                cacheObj[temp] = level;
            }
            temp = ''
        }
        else if (query[i] === '}') {
            temp = temp.replace(/[\n]/g, '').trim();
            temp = temp.replace(/[\s]+/g, ' ');
            temp = temp.replace(whiteSpaceBeforeParenRegex, '');
            if (temp !== "") {
                cacheObj[temp] = level + 1;
            }
            temp = ''
            level -= 1;
            if (level === 0) {
                globalCacheArr.push(cacheObj)
                cacheObj = {}
            }
        }
        else if (level > -1) {
            temp += query[i];
        }
    }
    return globalCacheArr;
  }

export default layerQueryFields  




