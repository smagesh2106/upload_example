const validator = (subject, type) => {
    let pattern
    switch (type) {
        case 'email':
            pattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
            return pattern.test(subject)
        case 'dateComparison':
            if ((new Date(subject[0])).getTime() > (new Date(subject[1])).getTime())
                return -1
            if ((new Date(subject[0])).getTime() < (new Date(subject[1])).getTime())
                return 1
            return 0
        case 'timestamp':
            pattern = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.(\d{3}))?Z$/
            return pattern.test(subject)
    }
};

module.exports = validator;

