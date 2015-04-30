# notepads-ionic
The mobile companion app for https://notepads.iliyan-trifonov.com hosted on https://play.google.com/store/apps/details?id=com.iliyan_trifonov.notepads

This is the source code of the Android App built with Ionic and hosted [here](https://play.google.com/store/apps/details?id=com.iliyan_trifonov.notepads "Notepads").

It uses the API from my original [NodeJS+AngularJS app](https://github.com/iliyan-trifonov/notepads-nodejs-angularjs-mongodb-bootstrap "Notepads") here: https://notepads.iliyan-trifonov.com/api/v1.

The application uses Facebook login with no extra permissions required. The Facebook Id, name and photo are stored in the database. An unique access token is created on first login(user creation). This access token is used to communicate with the API.

First copy the www/js/config.js.dist to www/js/config.js and put your settings in it. You can extract an existing user data from the database and put it in the config as a mockUser to test the ionic app locally in the browser.

The Facebook plugin(com.phonegap.plugins.facebookconnect) works only with emulators and mobile devices and provides the best connect experience using the locally installed Facebook app or falls back to a browser login. This makes it very fast and easy to just tap login on this app and forget.

Install required npm and bower modules:

    npm install && bower install

Install the required cordova plugins:

    cordova plugin add com.ionic.keyboard org.apache.cordova.inappbrowser org.apache.cordova.device

The Facebook plugin is installed manually:

    cd ~
    git clone https://github.com/Wizcorp/phonegap-facebook-plugin.git
    cd notepads-ionic/
    ionic platform add android
    cordova -d plugin add ~/phonegap-facebook-plugin/ --variable APP_ID="YOUR FB APP ID" --variable APP_NAME="YOUR FB APP NAME"
    ionic build android

Run the application:

It can be fully tested in the browser locally:

    ionic serve

Or run it in Android emulator or a connected real device:

    ionic run android

I don't have the possibility at the moment to test it with iOS but it should be fully compatible.
The commands for iOS will be:

    cordova platform add ios
    #don't forget to (re)install the Facebook connect plugin here **after** adding the platform
    ionic run ios
