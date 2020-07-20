module.exports = (req_obj, ...allowedFields) => {

    let newObj = {};

    Object.keys(req_obj).forEach( (el) => {
        if(allowedFields.includes(el))
        {
            newObj[el] = req_obj[el];
        }
    });

    return newObj;

};