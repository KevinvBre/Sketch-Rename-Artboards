/*  2019.02.12, By: Kevin van Breemaat, kevinvanbreemaat.nl     */

let td = NSThread.mainThread().threadDictionary();

/*

    Script replaces all NEW lines that are drawn with rectangles.
    This can NOT be done be fore the InsertLine is done.
    How ever.

    InsertLine.begin  = when you hit 'L'
    InsertLine.finsih  = when you first click mouse down.
    There is no 'InsertLine.finsihDrag'. So a little trickery is needed.

    1. InsertLine has been called
    2. InsertLineCount = 0
    3. lineState = true
    4. SelectionChanged RUN 1:  tell plugin a lineHasBeenDrawn. This the 'InsertLine.finsihDrag'.
    5. Sketch will automatically select the new layer thus:
    6. SelectionChanged RUN 2: check if the line is straight
    7. SelectionChanged RUN 2: draw a rect and remove the line.

*/

// triggers on 'l' hit by user
function InsertLine(context_){
    td.lineState = 'true';
    td.lineCount = 0;
    context_.actionContext.document.showMessage("Line drawn");//debugging
 }


function SelectionChanged(context_){
     if(td.lineCount == 1){
        td.lineState = 'false';
        td.lineCount = 0;

        var l = context_.actionContext.oldSelection[0];
        // thanks
        // https://sketchplugins.com/d/389-x1-x2-y1-y2-values-from-a-line/5
        if(l.x1() == l.x2()){
            addRectFromLine(l, context_);
            // context_.actionContext.document.showMessage("vertical line");
        }else if(l.y1() == l.y2()){
            addRectFromLine(l, context_);
            // context_.actionContext.document.showMessage("horizontal line");
        }else{
            // context_.actionContext.document.showMessage("not a straight line");
        }



        ga(context_, "Line2RectComp");
     }
     if(td.lineState == 'true'){
            // context_.actionContext.document.showMessage("SelectionChanged drawn1");
            td.lineCount = 1;
     }
}

function addRectFromLine(l, context_) {
    // thanks:
    // https://sketchplugins.com/d/432-insert-new-layer-underneath-other-layers/4
    // https://sketchplugins.com/d/56-drawing-shapes-programmatically/2
    // https://github.com/Ashung/Automate-Sketch

    var rx = Math.round(l.x1());
    var ry = Math.round(l.y1());
    var rw = Math.round(Math.abs(l.x1() - l.x2()));
    var rh = Math.round(Math.abs(l.y1() - l.y2()));



    if(rw <= 1) rw = 1;
    if(rh <= 1) rh = 1;

    var rect = MSRectangleShape.alloc().init();
    rect.frame = MSRect.rectWithRect(NSMakeRect(rx, ry, rw, rh));
    rect.name = "testing";

    var fill = rect.style().addStylePartOfType(0);
    fill.color = MSImmutableColor.colorWithSVGString("#d8d8d8");



    var container = l.parentGroup();
    if(container.class() != "MSPage"){
        container.addLayer(rect);
    }

    //Thanks:
    // https://github.com/Ashung/Automate-Sketch
    // PS; idk why the docs dont mention this. l.remove(); would be to obvious...
    l.removeFromParent();

    // context_.actionContext.document.showMessage("shape drawn line");
}




/*  Default */

function openUrlInBrowser(url) {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
}
function website(context) {
    console.log("open");
    openUrlInBrowser("http://kevinvanbreemaat.nl/");
    ga(context, "HelpLine2Rect");
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
