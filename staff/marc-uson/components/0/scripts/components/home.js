'use strict';

/**
 *
 * @param {*} form
 */
function Home(form){
    Component.call(this, form);
}

Home.prototype = Object.create(Component.prototype);
Home.prototype.constructor = SignIn;