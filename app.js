const asyncHandler = require('express-async-handler');
const _ = require('lodash');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const {window} = new JSDOM('<html></html>');
const $ = require('jquery')(window);
const nodeMailer = require('nodemailer');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));
app.use(express.json({limit: '50mb'}));

app.set('view engine', 'ejs');

app.get('/', asyncHandler(async function (req, res) {
    res.render('index');
}));

app.post('/upload', asyncHandler(async function (req, res) {
    let fileContent = req.body.fileContent;
    let email = req.body.email;
    if (fileContent) {
        let results = await execute(fileContent,email);
        return res.json(results);
    }
    res.send("DONE");
}));
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

async function execute(fileContent,sendTo) {
    let jsonObj = parseDocument(fileContent);
    await sendFromGmail("The report's conclusions", jsonObj,sendTo);
    return jsonObj;
}

async function sendFromGmail(subject, emailObj,sendTo) {
    let user = "danielabrgel91temp@gmail.com";
    let pass = "Danielzz91";
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {user: user, pass: pass}
    });
    const items = [];
    for (const item of emailObj) {
        items.push(`<li><b>${item.key}:</b><span>${item.value}</span></li>`);
    }

    let template = "<div><ul>" + items.join('') + "</ul></div>";
    const mail = {from: user, to: sendTo, subject, html: template};
    try {
        let info = await transporter.sendMail(mail);
        console.log('Email sent: ' + info.response);
    }
    catch (err) {
        console.log(err);
    }
}

function parseDocument(document) {
    document = new $(document);
    let parsedItems = [];
    let results = [];
    let trs = document.find("tr");
    $.each(trs, function () {
        $(this).find('td').remove('.tdhEn');
        let tds = $(this).find('td');
        parsedItems.push({key: tds.eq(1).text(), value: tds.eq(0).text()});
    });
    let fortune = _.find(parsedItems,{key:"סה\"כ הון"});
    if(fortune){
        results.push({
            key:"סה\"כ הון",
            value:parseFloat(fortune.value)
        })
    }

    let correctAssets = _.find(parsedItems,{key:"סה\"כ נכסים שוטפים"});
    let currentLiabilities = _.find(parsedItems,{key:"סה\"כ התחייבויות שוטפות"});
    if(correctAssets && currentLiabilities){
        results.push({
            key: "סה\"כ נכסים שוטפים/סה\"כ התחייבויות שוטפות",
            value: parseFloat(correctAssets.value) / parseFloat(currentLiabilities.value)
        });
    }
    let grossProfit = _.find(parsedItems,{key:"רווח גולמי"});
    let revenue = _.find(parsedItems,{key:"הכנסות"});
    if(grossProfit && revenue){
        results.push({
            key:"רווח גולמי/סה\"כ הכנסות",
            value: parseFloat(grossProfit.value) / parseFloat(revenue.value)
        })
    }
    console.log(_.find(results,{key:"רווח גולמי/סה\"כ הכנסות"}));
    return results;
}

app.get('*',(req,res)=>{
    res.render('404',{
        title:'404',
        name:'Daniel Abrgel',
        error:"Page not found."
    })

})



function loadContent() {
    return `<html dir="ltr" xmlns:ifrs-gp="http://xbrl.iasb.org/int/fr/ifrs/gp/2006-08-15" xmlns:il-ifrs-gp="http://xbrl.isa.gov.il/il/fr/ifrs/gp/2007-09-01" xmlns:ifrs-full="http://xbrl.ifrs.org/taxonomy/2015-03-11/ifrs-full" xmlns:ifrs-il="http://xbrl.isa.gov.il/taxonomy/2016-09-01/ifrs-il" xmlns:xbrl="http://www.xbrl.org/2003/instance" xmlns:link="http://www.xbrl.org/2003/linkbase" xmlns:xlink="http://www.w3.org/1999/xlink"><head><style type="text/css">
          td
          {
          text-align: center;
          white-space: nowrap;
          }
          td.tdhEn
          {
          font-weight: bold;
          width: 650px;
          text-align: left;
          direction: ltr;
          }
          td.tdhHe
          {
          font-weight: bold;
          width: 650px;
          text-align: right;
          direction: rtl;
          }
          td.disclaimerEn
          {
          width: 650px;
          text-align: left;
          direction: ltr;
          font-size: 11px;
          }
          td.disclaimerHe
          {
          width: 650px;
          text-align: right;
          direction: rtl;
          font-size: 11px;
          }
        </style></head><body><table style="text-align:left"><tr><td class="disclaimerEn">
              The information hereby presented is based on certain financial information taken from periodic and/or quarterly financial statements<br />
              as submitted on the reporting form in MAGNA by authorized electronic signatories (as such term is defined in the Securities Law<br />
              Regulations (Electronic Signature and Reporting), 2003) of the reporting corporations. The choice of the above mentioned information<br />
              is not, in any way, an expression of opinion regarding its importance and\\or meaningfulness, relative to other information provided<br />
              in the periodic and/or quarterly financial statements which was not required to be submitted on the reporting form in MAGNA.<br />
              The Israel Securities Authority is not in any way responsible for the content and/or credibility and\\or accuracy and\\or completeness<br />
              of the abovementioned information and the use of the information query is at the sole responsibility of the user.<br /><br />
              The way of reporting and/or presentation hereby introduced (which is derived from the XBRL format) may differ from the way of<br />
              reporting and/or presentation introduced in the regular query form (which is not derived from the XBRL format) and also may differ<br />
              from the way of reporting and/or presentation in the periodic and/or quarterly financial statements submitted by the reporting<br />
              corporations. It is hereby clarified that in any case of divergences between the information hereby presented and the information<br />
              submitted in the reporting form on Magna on behalf of the reporting corporation and/or the information presented in the periodic<br />
              and/or quarterly financial statements submitted by the reporting corporations, the latter information presented in the periodic<br />
              and/or quarterly financial statements will prevail.
            </td><td /><td class="disclaimerHe">
              הנתונים המוצגים בזאת מבוססים על נתונים מסוימים מתוך הדוחות התקופתיים ו/או הרבעוניים כפי שהוזנו בטופס הדיווח במגנ"א על ידי<br />
              "מורשי חתימה אלקטרונית" (כהגדרתם בתקנות ניירות ערך (חתימה ודיווח אלקטרוני), התשס"ג – 2003), של התאגידים המדווחים. יודגש כי אין<br />
              בבחירת הנתונים כאמור משום הבעת דעה בכל צורה שהיא על חשיבותם ו/או מהותיותם ביחס לנתונים אחרים בדוחות התקופתיים ו/או הרבעוניים<br />
              שלא נתבקשה הזנתם בטופס הדיווח במגנ"א. רשות ניירות ערך אינה אחראית בכל צורה שהיא לתוכנם ו/או מהימנותם ו/או נכונותם ו/או שלמותם<br />
              של הנתונים כאמור, והאחריות הבלעדית לשימוש בשאילתא היא על המשתמש בלבד.<br /><br />
              אופן הדיווח ו/או ההצגה המובאים בזאת (אשר מקורם בפורמט XBRL) עשויים להיות שונים מאופן הדיווח ו/או ההצגה המתקבלים בשאילתת הנתונים<br />
              הרגילה (אשר מקורה אינו בפורמט XBRL) וכן עשויים להיות שונים מאופן הדיווח ו/או ההצגה כפי שהם מובאים בדוחות התקופתיים ו/או הרבעוניים<br />
              שהוגשו על ידי התאגיד המדווח.<br />
              יובהר, כי בכל מקרה של אי התאמה בין הנתונים המובאים בזאת ובין אלו שהוזנו בטופס  הדיווח במגנ"א בשם התאגיד המדווח ו/או הנתונים<br />
              המוצגים בדוחות התקופתיים ו/או הרבעוניים שהוגשו על ידי התאגיד המדווח, יחייבו הנתונים המוצגים בדוחות התקופתיים ו/או הרבעוניים כאמור.
              
            </td></tr><tr><td colspan="3" style="height:15px;" /></tr><tr><td class="tdhEn">General information about the report [abstract]</td><td /><td class="tdhHe">נתונים כלליים של הדוח [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:20px">Form Short Name</td><td>ת930</td><td class="tdhHe" style="padding-right:20px">שם מקוצר של הטופס</td></tr><tr><td class="tdhEn" style="padding-left:20px">Report Subject Matter</td><td>דוח תקופתי / רבעוני / חצי שנתי </td><td class="tdhHe" style="padding-right:20px">הנדון</td></tr><tr><td class="tdhEn" style="padding-left:20px">Report Reference Number</td><td>2019-01-022033</td><td class="tdhHe" style="padding-right:20px">מספר אסמכתא של הדוח</td></tr><tr><td class="tdhEn" style="padding-left:20px">Report Receipt Time</td><td>2019-03-13T19:57:00+02:00</td><td class="tdhHe" style="padding-right:20px">מועד קליטה של הדוח</td></tr><tr><td class="tdhEn" style="padding-left:20px">Report Distribution Time</td><td>2019-03-13T20:01:00+02:00</td><td class="tdhHe" style="padding-right:20px">מועד פרסום של הדוח</td></tr><tr><td class="tdhEn" style="padding-left:20px">Report Filed With Israel Securities Authority</td><td>true</td><td class="tdhHe" style="padding-right:20px">מופץ לרשות ניירות ערך כן / לא</td></tr><tr><td class="tdhEn" style="padding-left:20px">Report Filed With Tel Aviv Stock Exchange</td><td>true</td><td class="tdhHe" style="padding-right:20px">מופץ לבורסה לניירות ערך כן / לא</td></tr><tr><td class="tdhEn" style="padding-left:20px">Commentary about the report</td><td /><td class="tdhHe" style="padding-right:20px">טקסט חופשי</td></tr><tr><td class="tdhEn" style="padding-left:20px">Related Report 1 Reference Number</td><td /><td class="tdhHe" style="padding-right:20px">מספר אסמכתא 1 של דוח קשור</td></tr><tr><td class="tdhEn" style="padding-left:20px">Related Report 2 Reference Number</td><td /><td class="tdhHe" style="padding-right:20px">מספר אסמכתא 2 של דוח קשור</td></tr><tr><td class="tdhEn" style="padding-left:20px">Related Report 3 Reference Number</td><td /><td class="tdhHe" style="padding-right:20px">מספר אסמכתא 3 של דוח קשור</td></tr><tr><td colspan="3" style="height:10px;" /></tr><tr><td class="tdhEn">General information about the reporting entity [abstract]</td><td /><td class="tdhHe">נתונים על החברה המדווחת [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:20px">English Name of Reporting Entity</td><td>MORDECHAI AVIV TAASIOT BENIYAH (1973) LTD</td><td class="tdhHe" style="padding-right:20px">שם חברה מדווחת באנגלית</td></tr><tr><td class="tdhEn" style="padding-left:20px">Hebrew Name of Reporting Entity</td><td>מרדכי אביב תעשיות בניה (1973) בע"מ</td><td class="tdhHe" style="padding-right:20px">שם חברה מדווחת בעברית</td></tr><tr><td class="tdhEn" style="padding-left:20px">Corporate Registration Number of Reporting Entity</td><td>520039264</td><td class="tdhHe" style="padding-right:20px">מספר ברשם החברות של החברה המדווחת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Reporting Entity Securities Traded on Tel Aviv Stock Exchange</td><td>true</td><td class="tdhHe" style="padding-right:20px">האם ניירות הערך של החברה המדווחת נסחרים בבורסה לניירות ערך בתל אביב כן / לא</td></tr><tr><td class="tdhEn" style="padding-left:20px">Short Name at Tel Aviv Stock Exchange of Reporting Entity</td><td>אביב בניה</td><td class="tdhHe" style="padding-right:20px">שם מקוצר של החברה המדווחת בבורסה לניירות ערך בתל אביב</td></tr><tr><td class="tdhEn" style="padding-left:20px">Main Telephone Number of Reporting Entity</td><td>02-6214444</td><td class="tdhHe" style="padding-right:20px">טלפון ראשי של החברה המדווחת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Additional Telephone Number of Reporting Entity</td><td>02-6214453</td><td class="tdhHe" style="padding-right:20px">טלפון נוסף של החברה המדווחת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Main Fax Number of Reporting Entity</td><td>02-6232444</td><td class="tdhHe" style="padding-right:20px">מספר פקס ראשי של החברה המדווחת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Street Name of Reporting Entity</td><td>אגריפס</td><td class="tdhHe" style="padding-right:20px">שם הרחוב של החברה המדווחת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Street Number of Reporting Entity</td><td>40</td><td class="tdhHe" style="padding-right:20px">מספר הבית של החברה המדווחת</td></tr><tr><td class="tdhEn" style="padding-left:20px">City of Reporting Entity</td><td>ירושלים</td><td class="tdhHe" style="padding-right:20px">ישוב החברה המדווחת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Zip Code of Reporting Entity</td><td>9430122</td><td class="tdhHe" style="padding-right:20px">מיקוד החברה המדווחת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Email Address of Reporting Entity</td><td>YEDID@MAVIV.CO.IL</td><td class="tdhHe" style="padding-right:20px">כתובת דואר אלקטרוני של החברה המדווחת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Website of Reporting Entity</td><td /><td class="tdhHe" style="padding-right:20px">כתובת אתר האינטרנט של החברה המדווחת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Previous Hebrew Names of Reporting Entity</td><td>סף אור בניה מתועשת בע"מ</td><td class="tdhHe" style="padding-right:20px">שמות קודמים בעברית של החברה המדווחת</td></tr><tr><td colspan="3" style="height:10px;" /></tr><tr><td class="tdhEn">Information about amended report [abstract]</td><td /><td class="tdhHe">דוח מתקן [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:20px">Submission date of amended report</td><td /><td class="tdhHe" style="padding-right:20px">דוח מתקן לדוח שגוי שנשלח בתאריך</td></tr><tr><td class="tdhEn" style="padding-left:20px">Amended Report Reference Number</td><td /><td class="tdhHe" style="padding-right:20px">דוח מתקן לדוח שגוי שהאסמכתא שלו</td></tr><tr><td class="tdhEn" style="padding-left:20px">Description of incorrect items in original report</td><td /><td class="tdhHe" style="padding-right:20px">השגיאה בדוח המקורי שבגינה נדרש הדוח המתקן</td></tr><tr><td class="tdhEn" style="padding-left:20px">Description of cause of error(s) [text block]</td><td /><td class="tdhHe" style="padding-right:20px">סיבת השגיאה בדוח שבגינה נשלח דוח מתקן</td></tr><tr><td class="tdhEn" style="padding-left:20px">Description of main amendments to original report [text block]</td><td /><td class="tdhHe" style="padding-right:20px">עיקרי התיקונים לדוח המקורי</td></tr><tr><td colspan="3" style="height:10px;" /></tr><tr><td class="tdhEn">Information about supplementary report [abstract]</td><td /><td class="tdhHe">דוח משלים [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:20px">Submission date of supplementary report</td><td /><td class="tdhHe" style="padding-right:20px">דוח משלים לדוח שנשלח בתאריך</td></tr><tr><td class="tdhEn" style="padding-left:20px">Supplementary Report Reference Number</td><td /><td class="tdhHe" style="padding-right:20px">דוח משלים לדוח שמספר האסמכתא שלו</td></tr><tr><td class="tdhEn" style="padding-left:20px">Disclosure of main information about supplementary report [text block]</td><td /><td class="tdhHe" style="padding-right:20px">עיקרי הפרטים של הדוח המשלים</td></tr><tr><td colspan="3" style="height:10px;" /></tr><tr><td class="tdhEn">Information about periodic report [abstract]</td><td /><td class="tdhHe">דוח תקופתי [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:20px">Year of periodic report</td><td>2018</td><td class="tdhHe" style="padding-right:20px">דוח תקופתי לשנת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Signature date of periodic report</td><td>2019-03-13</td><td class="tdhHe" style="padding-right:20px">דוח תקופתי שנחתם בתאריך</td></tr><tr><td class="tdhEn" style="padding-left:20px">Date of shareholders meeting if convened to present financial statements</td><td /><td class="tdhHe" style="padding-right:20px">מועד האסיפה - ככל שזומנה אסיפת בעלי מניות שבה יוצגו הדוחות הכספיים</td></tr><tr><td class="tdhEn" style="padding-left:20px">Disclosure of signatory information of periodic report [abstract]</td><td /><td class="tdhHe" style="padding-right:20px">פרטי החותם על הדוח התקופתי [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:40px">Name of periodic report signatory</td><td>tאורי מור</td><td class="tdhHe" style="padding-right:40px">שם החותם על הדוח התקופתי</td></tr><tr><td class="tdhEn" style="padding-left:40px">Position of Periodic Report Signatory</td><td>יו"ר דירקטוריון</td><td class="tdhHe" style="padding-right:40px">תפקיד החותם על הדוח התקופתי</td></tr><tr><td class="tdhEn" style="padding-left:40px">Name of periodic report signatory</td><td>אסף אביב </td><td class="tdhHe" style="padding-right:40px">שם החותם על הדוח התקופתי</td></tr><tr><td class="tdhEn" style="padding-left:40px">Position of Periodic Report Signatory</td><td>מנכ"ל</td><td class="tdhHe" style="padding-right:40px">תפקיד החותם על הדוח התקופתי</td></tr><tr><td colspan="3" style="height:10px;" /></tr><tr><td class="tdhEn">Information about financial statement [abstract]</td><td /><td class="tdhHe">דוחות כספיים [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:20px">Year of periodic financial statements</td><td>2018</td><td class="tdhHe" style="padding-right:20px">דוחות כספיים תקופתיים לשנת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Period of interim financial statements</td><td /><td class="tdhHe" style="padding-right:20px">דוחות כספיים ביניים לתקופה</td></tr><tr><td class="tdhEn" style="padding-left:20px">Interim financial statements end date</td><td /><td class="tdhHe" style="padding-right:20px">דוחות כספיים ביניים לתקופה שנסתיימה ביום</td></tr><tr><td class="tdhEn" style="padding-left:20px">Signature date of financial statements</td><td /><td class="tdhHe" style="padding-right:20px">תאריך החתימה על הדוחות הכספיים</td></tr><tr><td class="tdhEn" style="padding-left:20px">Attached Auditor Opinion or Auditor Review</td><td>חוות דעת מבקרים</td><td class="tdhHe" style="padding-right:20px">מצורפת חוות דעת רואה החשבון המבקר / סקירת רואה החשבון המבקר</td></tr><tr><td class="tdhEn" style="padding-left:20px">Signature date of review or opinion by auditor</td><td>2019-03-13</td><td class="tdhHe" style="padding-right:20px">תאריך חתימת רואה החשבון המבקר על חוות הדעת / סקירה</td></tr><tr><td class="tdhEn" style="padding-left:20px">Name of Auditing Firm</td><td>בריטמן אלמגור זהר ושות</td><td class="tdhHe" style="padding-right:20px">שם משרד רואה החשבון המבקר</td></tr><tr><td class="tdhEn" style="padding-left:20px">Auditor's unqualified opinion</td><td>true</td><td class="tdhHe" style="padding-right:20px">חוות הדעת ניתנת בנוסח האחיד (בלתי מסויג) כן / לא</td></tr><tr><td class="tdhEn" style="padding-left:20px">Auditor's unqualified review</td><td /><td class="tdhHe" style="padding-right:20px">דוח הסקירה ניתן בנוסח האחיד (בלתי מסויג) כן / לא</td></tr><tr><td class="tdhEn" style="padding-left:20px">Date of Authorization of Financial Statements</td><td>2019-03-13</td><td class="tdhHe" style="padding-right:20px">תאריך אישור הדוחות הכספיים</td></tr><tr><td class="tdhEn" style="padding-left:20px">Disclosure of signatory information of financial statements [abstract]</td><td /><td class="tdhHe" style="padding-right:20px">פרטי החותם על הדוחות הכספיים [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:40px">Name of financial statements signatory</td><td>אורי מור</td><td class="tdhHe" style="padding-right:40px">שם החותם על הדוחות הכספיים</td></tr><tr><td class="tdhEn" style="padding-left:40px">Position of Financial Statements Signatory</td><td>יו"ר דירקטוריון</td><td class="tdhHe" style="padding-right:40px">תפקיד החותם על הדוחות הכספיים</td></tr><tr><td class="tdhEn" style="padding-left:40px">Name of financial statements signatory</td><td>אסף אביב</td><td class="tdhHe" style="padding-right:40px">שם החותם על הדוחות הכספיים</td></tr><tr><td class="tdhEn" style="padding-left:40px">Position of Financial Statements Signatory</td><td>מנכ"ל</td><td class="tdhHe" style="padding-right:40px">תפקיד החותם על הדוחות הכספיים</td></tr><tr><td class="tdhEn" style="padding-left:40px">Name of financial statements signatory</td><td>ידיד ישראלי</td><td class="tdhHe" style="padding-right:40px">שם החותם על הדוחות הכספיים</td></tr><tr><td class="tdhEn" style="padding-left:40px">Position of Financial Statements Signatory</td><td>אחראי על תחום כספים</td><td class="tdhHe" style="padding-right:40px">תפקיד החותם על הדוחות הכספיים</td></tr><tr><td class="tdhEn" style="padding-left:20px">Information on Significant Associated Companies Whose Financial Statements are Attached</td><td /><td class="tdhHe" style="padding-right:20px">פרטי חברות כלולות מהותיות שדוחותיהן הכספיים מצורפים</td></tr><tr><td class="tdhEn" style="padding-left:40px">Name of Significant Associated Company</td><td /><td class="tdhHe" style="padding-right:40px">שם חברה כלולה מהותית</td></tr><tr><td class="tdhEn" style="padding-left:20px">Disclosure of information on guaranteed companies whose financial statements are attached [abstract]</td><td /><td class="tdhHe" style="padding-right:20px">פרטי חברות נערבות שדוחותיהן הכספיים מצורפים [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:40px">Name of Guaranteed Company</td><td /><td class="tdhHe" style="padding-right:40px">שם חברה נערבת</td></tr><tr><td class="tdhEn">Information about restatement of financial statements [abstract]</td><td /><td class="tdhHe">הצגה מחדש של דוחות כספיים [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:20px">Description of nature of restatement [text block]</td><td /><td class="tdhHe" style="padding-right:20px">מהות ההצגה מחדש</td></tr><tr><td class="tdhEn" style="padding-left:20px">Original Report Reference Number</td><td /><td class="tdhHe" style="padding-right:20px">מספר אסמכתא של דוח מקורי</td></tr><tr><td class="tdhEn" style="padding-left:20px">Date of restatement beginning</td><td /><td class="tdhHe" style="padding-right:20px">הצגה מחדש מתחילה בתאריך</td></tr><tr><td class="tdhEn" style="padding-left:20px">Date of restatement ending</td><td /><td class="tdhHe" style="padding-right:20px">הצגה מחדש מסתיימת בתאריך</td></tr><tr><td class="tdhEn" style="padding-left:20px">Restatement for Years</td><td /><td class="tdhHe" style="padding-right:20px">הצגה מחדש עבור השנים</td></tr><tr><td class="tdhEn" style="padding-left:20px">Restatement for Days</td><td /><td class="tdhHe" style="padding-right:20px">הצגה מחדש עבור הימים</td></tr><tr><td class="tdhEn">Information about management report [abstract]</td><td /><td class="tdhHe">דוח דירקטוריון [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:20px">Signature date of management report</td><td>2019-03-13</td><td class="tdhHe" style="padding-right:20px">דוח דירקטוריון שנחתם בתאריך</td></tr><tr><td class="tdhEn" style="padding-left:20px">Disclosure of signatory information of management report [abstract]</td><td /><td class="tdhHe" style="padding-right:20px">פרטי החותם על דוח הדירקטוריון [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:40px">Name of Management Report Signatory</td><td>אורי מור</td><td class="tdhHe" style="padding-right:40px">שם החותם על דוח הדירקטוריון</td></tr><tr><td class="tdhEn" style="padding-left:40px">Position of Management Report Signatory</td><td>יו"ר דירקטוריון</td><td class="tdhHe" style="padding-right:40px">תפקיד החותם על דוח הדירקטוריון</td></tr><tr><td class="tdhEn" style="padding-left:40px">Name of Management Report Signatory</td><td>אסף אביב</td><td class="tdhHe" style="padding-right:40px">שם החותם על דוח הדירקטוריון</td></tr><tr><td class="tdhEn" style="padding-left:40px">Position of Management Report Signatory</td><td>מנכ"ל</td><td class="tdhHe" style="padding-right:40px">תפקיד החותם על דוח הדירקטוריון</td></tr><tr><td colspan="3" style="height:10px;" /></tr><tr><td class="tdhEn">Currency</td><td>ILS</td><td class="tdhHe">מטבע</td></tr><tr><td colspan="3" style="height:10px;" /></tr><tr><td class="tdhEn">Statement of financial position [abstract]</td><td /><td class="tdhHe">דוח על המצב הכספי [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:20px">Assets [abstract]</td><td /><td class="tdhHe" style="padding-right:20px">נכסים [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:40px">Non-current assets [abstract]</td><td /><td class="tdhHe" style="padding-right:40px">נכסים לא שוטפים [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:60px">Total non-current assets</td><td>245997000</td><td class="tdhHe" style="padding-right:60px">סה"כ נכסים לא שוטפים</td></tr><tr><td class="tdhEn" style="padding-left:60px">Total current assets</td><td>527905000</td><td class="tdhHe" style="padding-right:60px">סה"כ נכסים שוטפים</td></tr><tr><td class="tdhEn" style="padding-left:40px">Total assets</td><td>773902000</td><td class="tdhHe" style="padding-right:40px">סה"כ נכסים</td></tr><tr><td class="tdhEn" style="padding-left:40px">Equity [abstract]</td><td /><td class="tdhHe" style="padding-right:40px">הון [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:80px">Equity attributable to owners of parent</td><td>262846000</td><td class="tdhHe" style="padding-right:80px">
                  סה"כ הון שניתן לייחוס לבעלים של החברה האם
                </td></tr><tr><td class="tdhEn" style="padding-left:60px">Non-controlling interests</td><td>0</td><td class="tdhHe" style="padding-right:60px">זכויות שאינן מקנות שליטה</td></tr><tr><td class="tdhEn" style="padding-left:60px">Equity</td><td>262846000</td><td class="tdhHe" style="padding-right:60px">סה"כ הון</td></tr><tr><td class="tdhEn" style="padding-left:40px">Equity and liabilities [abstract]</td><td /><td class="tdhHe" style="padding-right:40px">הון והתחייבויות [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:60px">Non-current liabilities [abstract]</td><td /><td class="tdhHe" style="padding-right:60px">התחייבויות לא שוטפות [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:80px">Non-current liabilities</td><td>177326000</td><td class="tdhHe" style="padding-right:80px">סה"כ התחייבויות לא שוטפות</td></tr><tr><td class="tdhEn" style="padding-left:60px">Current liabilities [abstract]</td><td /><td class="tdhHe" style="padding-right:60px">התחייבויות שוטפות [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:80px">CurrentLiabilities</td><td>333730000</td><td class="tdhHe" style="padding-right:80px">סה"כ התחייבויות שוטפות</td></tr><tr><td class="tdhEn" style="padding-left:60px">Liabilities</td><td>511056000</td><td class="tdhHe" style="padding-right:60px">סה"כ התחייבויות</td></tr><tr><td class="tdhEn" style="padding-left:40px">Equity and Liabilities</td><td>773902000</td><td class="tdhHe" style="padding-right:40px">סה"כ הון והתחייבויות</td></tr><tr><td colspan="3" style="height:10px;" /></tr><tr><td class="tdhEn">Profit or loss [abstract]</td><td /><td class="tdhHe">רווח או הפסד [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:60px">Revenue</td><td>127213000</td><td class="tdhHe" style="padding-right:60px">הכנסות</td></tr><tr><td class="tdhEn" style="padding-left:60px">Gross Profit</td><td>35257000</td><td class="tdhHe" style="padding-right:60px">רווח גולמי</td></tr><tr><td class="tdhEn" style="padding-left:40px">Profit (loss) from operating activities</td><td>30665000</td><td class="tdhHe" style="padding-right:40px">רווח (הפסד) מפעילויות תפעוליות</td></tr><tr><td class="tdhEn" style="padding-left:40px">Profit (Loss) Before Tax</td><td>29737000</td><td class="tdhHe" style="padding-right:40px">רווח (הפסד) לפני מס</td></tr><tr><td class="tdhEn" style="padding-left:40px">Profit (Loss)</td><td>23540000</td><td class="tdhHe" style="padding-right:40px">רווח (הפסד)</td></tr><tr><td class="tdhEn" style="padding-left:20px">Profit (loss), attributable to [abstract]</td><td /><td class="tdhHe" style="padding-right:20px">רווח (הפסד), שניתן לייחוס ל: [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:40px">Profit (loss), attributable to owners of parent</td><td>23540000</td><td class="tdhHe" style="padding-right:40px">רווח (הפסד) שניתן לייחוס לבעלים של החברה האם</td></tr><tr><td class="tdhEn" style="padding-left:40px">Profit (loss), attributable to non-controlling interests</td><td>0</td><td class="tdhHe" style="padding-right:40px">רווח (הפסד) שניתן לייחוס לזכויות שאינן מקנות שליטה</td></tr><tr><td class="tdhEn" style="padding-left:20px">Earnings per share [abstract]</td><td /><td class="tdhHe" style="padding-right:20px">רווח למניה [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:40px">Basic earnings (loss) per share</td><td>1.78</td><td class="tdhHe" style="padding-right:40px">סה"כ רווח (הפסד) בסיסי למניה</td></tr><tr><td class="tdhEn" style="padding-left:40px">Diluted earnings (loss) per share</td><td>1.78</td><td class="tdhHe" style="padding-right:40px">סה"כ רווח (הפסד) מדולל למניה</td></tr><tr><td class="tdhEn" style="padding-left:20px">Comprehensive income [abstract]</td><td /><td class="tdhHe" style="padding-right:20px">רווח כולל [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:40px">Comprehensive Income</td><td>27582000</td><td class="tdhHe" style="padding-right:40px">רווח כולל</td></tr><tr><td class="tdhEn" style="padding-left:60px">Comprehensive income attributable to [abstract]</td><td /><td class="tdhHe" style="padding-right:60px">רווח כולל שניתן לייחוס ל: [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:80px">Comprehensive income, attributable to owners of parent</td><td /><td class="tdhHe" style="padding-right:80px">רווח כולל שניתן לייחוס לבעלים של החברה האם</td></tr><tr><td class="tdhEn" style="padding-left:80px">Comprehensive income, attributable to non-controlling interests</td><td /><td class="tdhHe" style="padding-right:80px">רווח כולל שניתן לייחוס לזכויות שאינן מקנות שליטה</td></tr><tr><td colspan="3" style="height:10px;" /></tr><tr><td colspan="3" style="height:10px;" /></tr><tr><td class="tdhEn">Extract information from statement of cash flows [abstract]</td><td /><td class="tdhHe">נתונים מדוח תזרים מזומנים [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:20px">Cash flows from (used in) operating activities</td><td>45361000</td><td class="tdhHe" style="padding-right:20px">תזרימי מזומנים, נטו שנבעו (ששימשו) מפעילויות שוטפות</td></tr><tr><td class="tdhEn" style="padding-left:20px">Cash flows from (used in) investing activities</td><td>-2255000</td><td class="tdhHe" style="padding-right:20px">תזרימי מזומנים, נטו שנבעו (ששימשו) מפעילויות השקעה</td></tr><tr><td class="tdhEn" style="padding-left:20px">Cash flows from (used in) financing activities</td><td>-29043000</td><td class="tdhHe" style="padding-right:20px">תזרימי מזומנים, נטו שנבעו (ששימשו) מפעילויות מימון</td></tr><tr><td class="tdhEn" style="padding-left:20px">Effect of Exchange Rate Changes on Cash and Cash Equivalents</td><td>-3000</td><td class="tdhHe" style="padding-right:20px">השפעת שינויים בשערי חליפין של מטבע חוץ על מזומנים ושווי מזומנים</td></tr><tr><td colspan="3" style="height:10px;" /></tr><tr><td class="tdhEn">Information about the electronic signatory [abstract]</td><td /><td class="tdhHe">פרטי החותם האלקטרוני [כותרת]</td></tr><tr><td class="tdhEn" style="padding-left:20px">Name of Electronic Signatory</td><td>ישראלי ידיד</td><td class="tdhHe" style="padding-right:20px">שם החותם האלקטרוני</td></tr><tr><td class="tdhEn" style="padding-left:20px">Position of Electronic Signatory in Reporting Entity</td><td>מ"מ מנכ"ל וסמנכ"ל כספים</td><td class="tdhHe" style="padding-right:20px">תפקיד בחברה של החותם האלקטרוני</td></tr><tr><td class="tdhEn" style="padding-left:20px">Telephone Number of Electronic Signatory</td><td>02-6214470</td><td class="tdhHe" style="padding-right:20px">טלפון של החותם האלקטרוני</td></tr><tr><td class="tdhEn" style="padding-left:20px">Fax Number of Electronic Signatory</td><td>02-6232444</td><td class="tdhHe" style="padding-right:20px">פקס של החותם האלקטרוני</td></tr><tr><td class="tdhEn" style="padding-left:20px">Email Address of Electronic Signatory</td><td>yedid@maviv.co.il</td><td class="tdhHe" style="padding-right:20px">כתובת דואר אלקטרוני של החותם האלקטרוני</td></tr><tr><td class="tdhEn" style="padding-left:20px">Company of Electronic Signatory If Different from Reporting Entity</td><td /><td class="tdhHe" style="padding-right:20px">שם חברה של החותם האלקטרוני במידה ושונה מהחברה המדווחת</td></tr><tr><td class="tdhEn" style="padding-left:20px">Street Name of Electronic Signatory</td><td>בן יהודה</td><td class="tdhHe" style="padding-right:20px">שם הרחוב של החותם האלקטרוני</td></tr><tr><td class="tdhEn" style="padding-left:20px">Street Number of Electronic Signatory</td><td>34</td><td class="tdhHe" style="padding-right:20px">מספר הבית של החותם האלקטרוני</td></tr><tr><td class="tdhEn" style="padding-left:20px">City of Electronic Signatory</td><td>ירושלים</td><td class="tdhHe" style="padding-right:20px">ישוב החותם האלקטרוני</td></tr><tr><td class="tdhEn" style="padding-left:20px">Zip Code of Electronic Signatory</td><td>94583</td><td class="tdhHe" style="padding-right:20px">מיקוד החותם האלקטרוני</td></tr></table></body></html>`
}