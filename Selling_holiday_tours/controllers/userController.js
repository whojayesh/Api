const fs = require('fs');
const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`));


exports.getAllUsers = (req, res) => {
    res
        .status(200)
        .json({
            status: 'success',
            docs: users.length,
            data: users
        });
};

exports.createNewUser = (req, res) => {

    const id = users[users.length - 1]._id + "_aaa";
    const newUser = Object.assign({
        id
    }, req.body);

    users.push(newUser);

    fs.writeFile(`${__dirname}/../dev-data/data/users.json`, JSON.stringify(users), (err) => {
        if (!err) {
            res
                .status(201)
                .json({
                    status: 'success',
                    data: newUser
                });
        }
    });
};


exports.deleteUser = (req, res) => {

    const user = users.find((el) => el._id === req.params.id);

    if (!user) {
        return res.status(404)
            .send("invalid id");
    }

    res
        .status(204)
        .json({
            status: 'success',
        });
};

exports.updateUser = (req, res) => {

    const user = users.find((el) => el._id === req.params.id);

    if (!user) {
        return res.status(404)
            .send("invalid id");
    }

    res
        .status(203)
        .json({
            status: 'success',
        });
};


exports.getUser = (req, res) => {

    //console.log(req.params);
    const user = users.find((el) => el._id === req.params.id);

    if (!user) {
        return res.status(404)
            .send("invalid id");
    }

    res
        .status(203)
        .json({
            status: 'success',
            data: {
                user
            }
        });
};
