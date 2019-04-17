'use strict';

describe('logic', function () {
    var name = 'Peter';
    var surname = 'Seller';
    var email = 'peterseller@gmail.com';
    var password = '123';

    beforeEach(function () {
        users.length = 0;
    });

    describe('register', function () {
        it('should succeed on correct data', function () {
            var user = {
                name: name,
                surname: surname,
                email: email,
                password: password
            };

            var currentUsersCount = users.length;

            logic.register(name, surname, email, password);

            expect(users.length).toBe(currentUsersCount + 1);

            var lastUser = users[users.length - 1];
            expect(lastUser).toEqual(user);
        });

        describe('name control', function(){
            it('should fail on undefined name', function () {

                var _error;

                try {
                    logic.register(undefined, surname, email, password);
                } catch(error) {
                    _error = error;
                }

                expect(_error).toBeDefined();
                expect(_error.code).toBe(2);
            });

            it('should fail on empty name', function () {

                var _error;

                try {
                    logic.register('', surname, email, password);
                } catch(error) {
                    _error = error;
                }

                expect(_error).toBeDefined();
                expect(_error.code).toBe(2);
            });

            it('should fail name not a string', function () {

                var _error;

                try {
                    logic.register(2, surname, email, password);
                } catch(error) {
                    _error = error;
                }

                expect(_error).toBeDefined();
                expect(_error.code).toBe(2);
            });
        });

        describe('surname control', function(){
            it('should fail on undefined surname', function () {

                var _error;

                try {
                    logic.register(name, undefined, email, password);
                } catch(error) {
                    _error = error;
                }

                expect(_error).toBeDefined();
                expect(_error.code).toBe(3);
            });

            it('should fail on empty surname', function () {

                var _error;

                try {
                    logic.register(name, '', email, password);
                } catch(error) {
                    _error = error;
                }

                expect(_error).toBeDefined();
                expect(_error.code).toBe(3);
            });

            it('should fail surname not a string', function () {

                var _error;

                try {
                    logic.register(name, 2, email, password);
                } catch(error) {
                    _error = error;
                }

                expect(_error).toBeDefined();
                expect(_error.code).toBe(3);
            });
        });

        describe('email control', function(){
            it('should fail on undefined email', function () {

                var _error;

                try {
                    logic.register(name, surname, undefined, password);
                } catch(error) {
                    _error = error;
                }

                expect(_error).toBeDefined();
                expect(_error.code).toBe(4);
            });

            it('should fail on empty email', function () {

                var _error;

                try {
                    logic.register(name, surname, '', password);
                } catch(error) {
                    _error = error;
                }

                expect(_error).toBeDefined();
                expect(_error.code).toBe(4);
            });

            it('should fail email not a string', function () {

                var _error;

                try {
                    logic.register(name, surname, 2, password);
                } catch(error) {
                    _error = error;
                }

                expect(_error).toBeDefined();
                expect(_error.code).toBe(4);
            });
        });

        describe('pasword control', function(){
            it('should fail on undefined pasword', function () {

                var _error;

                try {
                    logic.register(name, surname, email, undefined);
                } catch(error) {
                    _error = error;
                }

                expect(_error).toBeDefined();
                expect(_error.code).toBe(5);
            });

            it('should fail on empty password', function () {

                var _error;

                try {
                    logic.register(name, surname, email, '');
                } catch(error) {
                    _error = error;
                }

                expect(_error).toBeDefined();
                expect(_error.code).toBe(5);
            });
        });

        it('should fail on existing email', function(){
            users.push({
                name: name,
                surname: surname,
                email: email,
                password: password
            });

            var _error;

            try {
                logic.register(name, surname, email, password);
            } catch(error) {
                _error = error;
            }

            expect(_error).toBeDefined();
            expect(_error.code).toBe(6);
        })
    });

    describe('login', function () {
        beforeEach(function () {
            users.push({
                name: name,
                surname: surname,
                email: email,
                password: password
            });
        });

        it('should succeed on correct data', function () {
            logic.login(email, password);

            expect(logic.__userEmail__).toBe(email);
            expect(logic.__accessTime__ / 1000).toBeCloseTo(Date.now() / 1000, 1);
        });

        it('should fail on wrong email (unexisting user)', function(){

            var _error;

            try {
                logic.login('pepitogrillo@gmail.com', password);
            } catch(error) {
                _error = error;
            }

            expect(_error).toBeDefined();
            expect(_error.code).toBe(1);
        });

        it('should fail on wrong password (existing user)', function(){
            // expect(function() {
            //     logic.login(email, '456');
            // }).toThrowError(Error, 'wrong credentials');

            var _error;

            try {
                logic.login(email, '456');
            } catch(error) {
                _error = error;
            }

            expect(_error).toBeDefined();
            expect(_error.code).toBe(1);
        });
    });

    describe('search ducks', function() {
        it('should succeed on correct query', function(done) {
            logic.searchDucks('yellow', function(ducks) {
                expect(ducks).toBeDefined();
                expect(ducks instanceof Array).toBeTruthy();
                expect(ducks.length).toBe(13);

                done();
            });
        });
        it('should fail on undefined query', function(done){
            expect(function () {
                logic.searchDucks(undefined, function(){});
            }).toThrowError(Error, 'undefined is not a valid query')
            done();
        });
        it('should fail on undefined function', function(done){
            expect(function () {
                logic.searchDucks('yellow');
            }).toThrowError(Error, 'undefined is not a function')
            done();
        });
    });

    describe('retrieve ducks', function() {
        it('should succeed on correct id', function(done) {
            logic.retrieveDucklingDetail('5c3853aebd1bde8520e66e11', function(duck) {
                expect(duck).toBeDefined();
                expect(duck instanceof Object).toBeTruthy();

                done();
            });
        });
        it('should fail on undefined id', function(done){
            expect(function () {
                logic.retrieveDucklingDetail(undefined, function(){});
            }).toThrowError(Error, 'undefined is not a valid query')
            done();
        });
        it('should fail on undefined function', function(done){
            expect(function () {
                logic.retrieveDucklingDetail('5c3853aebd1bde8520e66e11');
            }).toThrowError(Error, 'undefined is not a function')
            done();
        });
    });
});