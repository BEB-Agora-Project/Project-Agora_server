
module.exports = {
    getImgSrcString: (text) => {
        const regex = /<img[^>]+src=[\"']?([^>\"']+)[\"']?[^>]*>/g
        return regex.exec(text)[1]
    },

}