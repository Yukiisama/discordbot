/*jshint esversion: 6 */ 
const champions = require("../champions");
module.exports = (function(){
    // ==== UTIL FUNCTIONS
function getQueueIndex (q, arr, key){
    for (var i = 0; i < arr.length; i++){
      if(arr[i][key] === q){
        return i;
      }
    }
    return -1;
  }
  function getChampID(arg){
    input = arg.toLowerCase().charAt(0).toUpperCase() + arg.toLowerCase().slice(1);
    return champions.champList.data[input].id;
  }
  
  function formatField(data){
      let summoner = data.summonerName;
      let champ = getChampFromId(data.championId);
      let output = summoner+" - "+ champ;
      return setUniformLength(output);
  }
  function setUniformLength(str){        
      let difference = 50 - str.length;
      let output = difference >= 0 ? " ".repeat(difference) : "";
      return str+(output);
  }
  function getChampFromId(id){
      for (var key in champions.champList.data) {
          // skip loop if the property is from prototype
          if (!champions.champList.data.hasOwnProperty(key)) continue;
          var obj = champions.champList.data[key];
          if(obj.id === id){ return key;}
      }
      return "Not Found";
  }
  return {
      getQueueIndex: function(q, arr, key){
        return getQueueIndex(q, arr, key);
      },
      formatField: function(data){
        return formatField(data);
      },
      getChampFromId: function(id){
          return getChampFromId(id);
      },
      getChampID: function(arg){
        return getChampID(arg);
      }
  }
})();