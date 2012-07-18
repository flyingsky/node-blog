var path = require('path');
var fs = require('fs');

var mem = [];

exports.derhotzenplotz = function(req, res) {
    var pageObj = {locals: {info: null}};

    if (req.method == 'POST') {
        var email = req.param('email');
        var feedback = req.param('feedback');
        mem.push({
            email: email,
            feedback: feedback
        });

        console.log(req.param('submit'));
        pageObj.locals.info = req.param('submit') + ' Success';
    }
    res.render('demos/derhotzenplotz.jade', pageObj);
};

exports.upload = function(req, res) {
    if (req.method == 'GET') {
        res.render('demos/upload.jade', {
            locals:{
                uploaded: false
            }
        });
        return;
    }

    if (req.method == 'POST') {
        console.log(req.files);
        var filePath = req.files.displayImage.path;
        var extName = path.extname(req.files.displayImage.name);

        fs.readFile(filePath, function (err, data) {
            if (err) {
                res.send(err);
                return;
            }

            var imageUrl = "/upload/" + path.basename(filePath) + extName;
            var newPath = __dirname + "/../public" + imageUrl;

            fs.writeFile(newPath, data, function (err) {
                if (!err) {
                    res.render('demos/upload.jade', {
                        locals: {
                            uploaded: true,
                            imageUrl: imageUrl
                        }
                    });
                } else {
                    res.send(err);
                }
            });
        });
    }
};

//========== itrip ========
var easyimg = require('node-easyimage');
var path = require('path');
var fs = require('fs');
var thumbnails = [{"width":"192","height":"256","url":"demo_images/1.jpg"},{"width":"192","height":"192","url":"demo_images/10.jpg"},{"width":"192","height":"288","url":"demo_images/11.jpg"},{"width":"192","height":"127","url":"demo_images/12.jpg"},{"width":"192","height":"256","url":"demo_images/13.jpg"},{"width":"191","height":"287","url":"demo_images/14.jpg"},{"width":"191","height":"287","url":"demo_images/15.jpg"},{"width":"192","height":"122","url":"demo_images/16.jpg"},{"width":"192","height":"192","url":"demo_images/17.jpg"},{"width":"191","height":"258","url":"demo_images/18.jpg"},{"width":"192","height":"143","url":"demo_images/19.jpg"},{"width":"191","height":"255","url":"demo_images/2.jpg"},{"width":"192","height":"144","url":"demo_images/20.jpg"},{"width":"192","height":"144","url":"demo_images/21.jpg"},{"width":"192","height":"132","url":"demo_images/22.jpg"},{"width":"192","height":"288","url":"demo_images/23.jpg"},{"width":"192","height":"267","url":"demo_images/24.jpg"},{"width":"192","height":"143","url":"demo_images/25.jpg"},{"width":"192","height":"143","url":"demo_images/26.jpg"},{"width":"192","height":"134","url":"demo_images/27.jpg"},{"width":"192","height":"120","url":"demo_images/28.jpg"},{"width":"192","height":"288","url":"demo_images/29.jpg"},{"width":"192","height":"192","url":"demo_images/3.jpg"},{"width":"192","height":"143","url":"demo_images/30.jpg"},{"width":"192","height":"192","url":"demo_images/31.jpg"},{"width":"192","height":"192","url":"demo_images/32.jpg"},{"width":"192","height":"288","url":"demo_images/33.jpg"},{"width":"192","height":"127","url":"demo_images/34.jpg"},{"width":"192","height":"192","url":"demo_images/35.jpg"},{"width":"191","height":"246","url":"demo_images/36.jpg"},{"width":"192","height":"384","url":"demo_images/37.jpg"},{"width":"192","height":"256","url":"demo_images/38.jpg"},{"width":"192","height":"256","url":"demo_images/39.jpg"},{"width":"191","height":"288","url":"demo_images/4.jpg"},{"width":"191","height":"277","url":"demo_images/40.jpg"},{"width":"192","height":"257","url":"demo_images/41.jpg"},{"width":"191","height":"287","url":"demo_images/42.jpg"},{"width":"48","height":"48","url":"demo_images/43.jpg"},{"width":"48","height":"48","url":"demo_images/44.jpeg"},{"width":"48","height":"48","url":"demo_images/45.jpg"},{"width":"48","height":"48","url":"demo_images/46.jpg"},{"width":"48","height":"48","url":"demo_images/47.jpg"},{"width":"48","height":"48","url":"demo_images/48.jpg"},{"width":"48","height":"48","url":"demo_images/49.jpg"},{"width":"192","height":"143","url":"demo_images/5.jpg"},{"width":"192","height":"144","url":"demo_images/6.jpg"},{"width":"192","height":"234","url":"demo_images/7.jpg"},{"width":"192","height":"191","url":"demo_images/8.jpg"},{"width":"191","height":"219","url":"demo_images/9.jpg"}];

exports.gallery = function(req, res) {
    var pageIndex = parseInt(req.param('page'));
    pageIndex = isNaN(pageIndex) ? 0 : pageIndex;

    var pageSize, itemStart, itemEnd;

    if (pageIndex <= 0) {
        pageSize = 6;
        itemStart = 12 - (1-pageIndex) * pageSize;
        itemEnd = itemStart + pageSize;
    } else {
        pageSize = 12;
        itemStart = pageIndex * pageSize;
        itemEnd = itemStart + pageSize;
    }
    console.log(itemStart + ', ' + itemEnd);

    var imgRelativeDir = 'demo_images';
    var imgAbsoluteDir = path.join(process.pwd, 'public', imgRelativeDir);

    if (!thumbnails) {
        thumbnails = [];
        fs.readdir(imgAbsoluteDir, function(err, imgs) {
            if (err) {
                res.send(err);
                return;
            }

            imgs.forEach(function(imgFileShortName, index){
                var imgPath = path.join(imgAbsoluteDir, imgFileShortName);
                var relativePath = path.join(imgRelativeDir, imgFileShortName);

                easyimg.info(imgPath, function(err, features) {
                    if (err) {
                        console.log('error in identify for: ' + imgPath);
                        throw err;
                        res.send(err);
                    }

                    var thumbnail = {
                        width: features.width,
                        height: features.height,
                        //geometry: features.geometry,
                        url: relativePath
                    };
                    thumbnails[index] = thumbnail;

                    for(var i = 0; i < imgs.length; i++) {
                        if (!thumbnails[i]) {
                            return;
                        }
                    }

                    res.send(thumbnails.slice(itemStart/*, itemEnd*/));
                });
            });
        });
    } else {
        if (itemStart < 0) {
            res.send([]);
        } else {
            res.send(thumbnails.slice(itemStart, itemEnd));
        }
    }
};

exports.searchgallery = function(req, res) {
    if (thumbnails && thumbnails.length <= 0) {
        res.send([]);
    }

    var len = thumbnails.length;
    var itemStart = Math.floor((Math.random() * len));
    var itemEnd = itemStart + Math.floor((Math.random() * (len-itemStart)));
    console.log('searchgallery: ' + itemStart + ', ' + itemEnd);
    res.send(thumbnails.slice(itemStart, itemEnd));
};