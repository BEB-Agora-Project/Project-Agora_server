const fs = require('fs');


module.exports = {
    textFilter:async (text) => {
        const list = fs.readFileSync(__dirname +"/filteringList/word_list.txt", 'utf-8');
        const textByLine = list.split('\n')
        for (let badText of textByLine){
            if(text.includes(badText)){
                console.log(badText)
                console.log(text)
                return true
            }
        }
        return false
    },

}