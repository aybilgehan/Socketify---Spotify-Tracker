const Users = require("../dbHandler/user.model.js");


exports.getMainPage=async(req,res,next)=>{
    try{
        res.status(200).render("main")
    }
    catch(error){
        console.log(error);
    }
}
exports.postMainPage = async(req, res, next) => {
    try {

        let user = await Users.findOne({"email":req.body.email});
        if (!user) {
            res.send("köyüne dön"); 
            return;
        }
        req.session.user = user.email;
        res.render("index",{
            user: req.session.user
        });

    } catch (error) {
        console.log(error);
}};

exports.getRegisterPage = async(req, res, next) => {
    try {
    res.status(200).render("register");
        
    } catch (error) {
        console.log(error);
}};
exports.postRegisterPage = async(req, res, next) => {
    try {

        let checkEmail = await Users.findOne({"email":req.body.email})
        let checkUsername = await Users.findOne({"username":req.body.username})
        
        if (checkEmail){
            res.send("Emaile kayıtlı kullanıcı var");
            return;
        }else if (checkUsername){
            res.send("Username kayıtlı kullanıcı var");
            return;
        }
        else{
            await Users.create(req.body);
            res.send("<pre>kullanici olusturuldu.</pre> <a href='/'>Anasayfaya git</a>");
        }
    } catch (error) {
        console.log(error);
}};
exports.getLogoutPage = async(req, res, next) => {
    try {
        req.session.destroy();
        res.redirect("/");
    } catch (error) {
        console.log(error);
}};