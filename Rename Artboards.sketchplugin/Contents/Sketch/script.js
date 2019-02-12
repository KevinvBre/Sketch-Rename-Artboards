/*  2018.10.26, By: Kevin van Breemaat, kevinvanbreemaat.nl     */











// shortcut command: shift+cmd+ctrl and <--
function renameArtboardsOnPage(context_){

        /*  First google hit    https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array#9229932   Thanks to George        https://stackoverflow.com/users/989121/georg        */
        function uniq(a) {return Array.from(new Set(a));} // cleans up dublicates

        var doc = MSDocument.currentDocument();
        var artboards = doc.currentPage().artboards();

        var xCount = []; //verticaal
        var yCount = [];  //horizontaal

        for (var i = 0; i < artboards.count(); i++){
            if(artboards[i].layers().count() > 1){
                yCount.push(   artboards[i].frame().y()  );
            }
        }

        yCount.sort(function(a, b){return a-b});
        yCount = uniq(yCount); // cleans up dublicates

        /*
             per row kijken welken x posses er zijn.
             storen in een nested array.
        */
        for (var p = 0; p < yCount.length; p++) {
            var rowY = yCount[p];                               // save the row number
            for (var i = 0; i < artboards.count(); i++){        // loop artboards
                var layerY = artboards[i].frame().y();
                var layerX = artboards[i].frame().x();

                if(layerY == rowY){                             // layer Y should match the row y to be added
                    var valueToPush = new Array();
                    valueToPush[0] = layerX;
                    valueToPush[1] = p;


                    if(artboards[i].layers().count() > 1){
                        xCount.push(valueToPush);                   // store new array containd the layer number and x pos
                    }
                }
            }
        }


        /*
            Assign the names row by row
        */
        var currentArtboardnumbers = new Array();

        for (var p = 0; p < yCount.length; p++) {               // loop door rows
            var rowXposses = [];

            for (var i = 0; i < xCount.length; i++) if(xCount[i][1] == p)rowXposses.push(xCount[i][0]);                       // loop per row door de xpos
            rowXposses.sort(function(a, b){return a-b});

            for (var i = 0; i < artboards.count(); i++){
                let yIndex = yCount.indexOf(artboards[i].frame().y()); // find the current y row based on y value.
                if(yIndex == p){    // y index pos should match the current row number.
                    let xIndex = rowXposses.indexOf(artboards[i].frame().x());

                    var layerNameBase = artboards[i].name().split(" - "); // split a base
                    layerNameBase = layerNameBase[layerNameBase.length-1]; // remove the old numbers and save base

                   // remove the stupid Copy + space + number
                   if(layerNameBase.includes("Copy")){
                       layerNameBase = layerNameBase.replace(/\s+/g, '');
                       layerNameBase = layerNameBase.substring(0, layerNameBase.indexOf('Copy'));
                   }

                   var pageName = doc.currentPage().name();
                   var pageNameBase = pageName.split(" "); // split a base
                   pageNameBase = pageNameBase[0]; // remove the old numbers and save base


                   var name = pageNameBase + " " + yIndex + "." + xIndex + " - " + layerNameBase;    // create the name

                   artboards[i].setName(name);

                   var ab_number = yIndex + (xIndex /10);
                   console.log("ab_number: "+ ab_number);

                   var ab_numberToPush = new Array();
                   ab_numberToPush[0] = ab_number;
                   ab_numberToPush[1] = artboards[i];

                   currentArtboardnumbers.push(ab_numberToPush)//  store names to be sorted and artboard reoderring

                }
            }
        }

        for (var i = 0; i < artboards.count(); i++){
            if(artboards[i].layers().count() <= 1){
                console.log(artboards[i].name());
                artboards[i].setName("__");
            }
        }
        // currentArtboardnumbers.sort(function(a, b){return a-b});
        // console.log("##{#{#{#{}}}} 1");
        // console.log(currentArtboardnumbers);

        currentArtboardnumbers.sort(sortFunction);
        // First answer: https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value
        function sortFunction(a, b) {
            if (a[0] === b[0]) {
                return 0;
            }
            else {
                return (a[0] < b[0]) ? -1 : 1;
            }
        }


        // apply page order.
        for (var i = 0; i < currentArtboardnumbers.length; i++){
            var layer = currentArtboardnumbers[i][1];
            MSLayerMovement.moveToBack([layer]);
         }

        context_.document.showMessage("Artboards Renamed");
 }



/*  Default */

function openUrlInBrowser(url) {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
}
function website(context) {
    console.log("open");
    openUrlInBrowser("http://kevinvanbreemaat.nl/");
    ga(context, "HelpRename");
};



/*

    Everything below this line except the trackingID is a copy paste from:
    https://github.com/Ashung/Automate-Sketch

*/


function ga(context, eventCategory) {

    var trackingID = "UA-25194603-2";

    var uuidKey = "google.analytics.uuid";
    var uuid = NSUserDefaults.standardUserDefaults().objectForKey(uuidKey);
    if (!uuid) {
        uuid = NSUUID.UUID().UUIDString();
        NSUserDefaults.standardUserDefaults().setObject_forKey(uuid, uuidKey);
    }

    var appName = encodeURI(context.plugin.name()),
        appId = context.plugin.identifier(),
        appVersion = context.plugin.version();

    var url = "https://www.google-analytics.com/collect?v=1";
    // Tracking ID
    url += "&tid=" + trackingID;
    // Source
    url += "&ds=sketch" + MSApplicationMetadata.metadata().appVersion;
    // Client ID
    url += "&cid=" + uuid;
    // User GEO location
    url += "&geoid=" + NSLocale.currentLocale().countryCode();
    // User language
    url += "&ul=" + NSLocale.currentLocale().localeIdentifier().toLowerCase();
    // pageview, screenview, event, transaction, item, social, exception, timing
    url += "&t=event";
    // App Name
    url += "&an=" + appName;
    // App ID
    url += "&aid=" + appId;
    // App Version
    url += "&av=" + appVersion;
    // Event category
    url += "&ec=" + encodeURI(eventCategory);
    // Event action
    // url += "&ea=" + encodeURI(eventAction);
    url += "&ea=" + encodeURI(context.command.identifier());
    // Event label
    // if (eventLabel) {
    //     url += "&el=" + encodeURI(eventLabel);
    // }
    // Event value
    // if (eventValue) {
    //     url += "&ev=" + encodeURI(eventValue);
    // }

    var session = NSURLSession.sharedSession();
    var task = session.dataTaskWithURL(NSURL.URLWithString(NSString.stringWithString(url)));
    task.resume();

}
