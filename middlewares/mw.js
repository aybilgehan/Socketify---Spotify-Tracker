const Users = require("../dbHandler/user.model");


exports.session = async(req, res,next) => {
    try {

        let user = await Users.findOne({"email":req.session.user});
        if (!user) {
            res.send("köyüne dön"); 
        }
        next();

    } catch (error) {
        console.log(error);

}
console.log("Middleware Çalıştı");
};
