
class APIFeatures {
    constructor(queryObj, req_query) {
        this.queryObj = queryObj;
        this.req_query = req_query;
    }

    filter() {

        //STEP.1
        const filterQuery = {
            ...this.req_query
        };
        console.log(filterQuery);
        const excludeQuery = ['sort', 'fields', 'skip', 'limit'];
        //excludeQuery.forEach((el) => delete filterQuery[el] === el);*/

        const obj = {};

        Object.keys(filterQuery).forEach( (el) => {

            if(!excludeQuery.includes(el))
            {
                obj[el] = filterQuery[el];
                console.log(obj);
            }

        });

        console.log('below');
        console.log(obj);

        //console.log(filterQuery);

        //STEP.2
        let filterJSON = JSON.stringify(obj);
        //console.log(queryStr);
        filterJSON = filterJSON.replace(/\b(gte|gt|lt|lte)\b/g, match => '$' + match); //match is the part which matched the regEx.
        this.queryObj = this.queryObj.find(JSON.parse(filterJSON));
        return this;
    }

    sort() {
        if (this.req_query.sort) {
            const orderBy = this.req_query.sort.split(',').join(' ');
            this.queryObj = this.queryObj.sort(orderBy);  
        } else {
            this.queryObj = this.queryObj.sort('-createdAt');
        }
        return this;
    }

    fields() {
        if (this.req_query.fields) {

            const field = this.req_query.fields.split(',').join(' ');
            this.queryObj = this.queryObj.select(field);
        } else {
            this.queryObj = this.queryObj.select('-__v');
        }
        return this;
    }

    pagination()
    {
        const pages = this.req_query.page * 1 || 1;
        const limit = this.req_query.limit * 1 || 10;
        const skip = (pages - 1) * limit;
        this.queryObj = this.queryObj.skip(skip).limit(limit);

        /*if(this.req_query.page)
        {
            const totalDocs = await Tour.countDocuments();
            if(skip > totalDocs)
            {
                throw new Error('Page Not Found');
            }
        }*/

        return this;
    }

}

module.exports = APIFeatures;