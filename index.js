const puppeteer = require('puppeteer');
const moment = require('moment');
const CREDS = require('./creds');

function delay(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
}
function resolveThen() {
    return [(res)=>console.log('resolved'),(err)=>console.log('error')];
}


async function run() {
    //const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({
        headless: false
      });
    const page = await browser.newPage();

    await page.goto('https://rudots.t2hosted.com/cmn/auth_guest.aspx');

    const USERNAME_SELECTOR = '#ctl00_ctl01_MainContentPlaceHolder_T2Main_txtLogin';
    const PASSWORD_SELECTOR = '#ctl00_ctl01_MainContentPlaceHolder_T2Main_txtPassword';
    const LOGIN_BUTTON_SELECTOR = '#ctl00_ctl01_MainContentPlaceHolder_T2Main_cmdLogin';
    const GET_PERMIT_BUTTON_SELECTOR = 'body > div.container > div:nth-child(7) > div > div:nth-child(2) > section.col-sm-6.col-md-6.col-lg-6.widget-secondary-actions.flex-widget > div > div > a';
    const NEXT_BUTTON_SELECTOR = '#ctl00_ctl01_MainContentPlaceHolder_T2Main_cmdNext';
    const AGREE_CHECKBOX_SELECTOR = '#ctl00_ctl01_MainContentPlaceHolder_T2Main_chkAgreement_chk0';
    const NEXT_MONTH_EFFECTIVE_BUTTON_SELECTOR =  '#ctl00_ctl01_MainContentPlaceHolder_T2Main_calEffectiveDate > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > a';
    const NEXT_MONTH_EXPIRATION_BUTTON_SELECTOR =  '#ctl00_ctl01_MainContentPlaceHolder_T2Main_calExpirationDate > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > a';
    const LOT_INPUT_SELECTOR = '#ctl00_ctl01_MainContentPlaceHolder_T2Main_selFacility';
    const LIVI_SELECTOR = '#ctl00_ctl01_MainContentPlaceHolder_T2Main_selFacility > option:nth-child(8)';
    const PAY_NOW_SELECTOR = '#ctl00_ctl01_MainContentPlaceHolder_T2Main_collectEmailForAuthenticatedUser_btnContinue';
    const CONTINUE_SELECTOR = '#ctl00_SheetContentPlaceHolder_btnContinue';
    const PAY_WITH_CARD_SELECTOR = '#ctl00_SheetContentPlaceHolder_btnAddCreditCard';
    const CARD_TYPE_DROPDOWN_SELECTOR = '#ctl00_SheetContentPlaceHolder_AddCreditCard1_drpCardType_drpCardNames';
    const lotList = {
        livi: '2180',
        busch: '2178',
        doug: '2179',
        cook: '2181',
    }

    // PAYMENT ADDRESS SECTION
    const FIRST_NAME_ON_CARD_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_txtFirstNameOnCard';
    const LAST_NAME_ON_CARD_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_txtLastNameOnCard';
    const CARD_NUMBER_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_txtCardNumber';
    const CONFIRM_CARD_NUMBER_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_txtConfirmCardNumber';
    const CVV2_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_txtCVV2';
    // values 1-12 for each month
    const EXPIRATION_MONTH_DROPDOWN_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_drpMonth';
    // values are 4 digit representing a year
    const EXPIRATION_YEAR_DROPDOWN_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_drpYear';

    // CARD BILLING ADDRESS SECTION
    const FIRST_NAME_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_txtBillingFirstName';
    const LAST_NAME_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_txtBillingLastName';
    const ADDRESS_LINE_1_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_txtAddLine1';
    const CITY_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_txtCity';
    const ZIPCODE_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_txtZip';

    // value set to 'NJ'
    const STATE_DROPDOWN_SELECTOR = '#ctl00_SheetContentPlaceHolder_editCreditCard_drpStates_drpStates';
    // DEFAULTS TO UNITED STATES
    const COUNTRY_DROPDOWN_SELECTOR = '';



    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(CREDS.username);

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(CREDS.password);

    await page.click(LOGIN_BUTTON_SELECTOR);
    await page.waitForNavigation();
    console.log('Get Permit')
    await page.click(GET_PERMIT_BUTTON_SELECTOR);
    await page.waitForSelector(NEXT_BUTTON_SELECTOR);

    await page.click(NEXT_BUTTON_SELECTOR);
    await page.waitForSelector(NEXT_BUTTON_SELECTOR);

    await page.click(NEXT_BUTTON_SELECTOR);
    await page.waitForSelector(AGREE_CHECKBOX_SELECTOR);

    await page.click(AGREE_CHECKBOX_SELECTOR);
    await page.click(NEXT_BUTTON_SELECTOR);
    await page.waitForNavigation();

    // click next month
    let effective_date_tr = page.$('#ctl00_ctl01_MainContentPlaceHolder_T2Main_calEffectiveDate > tbody > tr');
    if (effective_date_tr.length < 0) {
        await page.click(NEXT_MONTH_EFFECTIVE_BUTTON_SELECTOR);
        await page.waitForSelector('input');
    }

    let expiration_date_tr = page.$('#ctl00_ctl01_MainContentPlaceHolder_T2Main_calExpirationDate > tbody > tr');
    if (expiration_date_tr.length < 0) {
        await page.click(NEXT_MONTH_EXPIRATION_BUTTON_SELECTOR);
        await page.waitForSelector('input');
    }

    let today = moment().format('MMMM D');

    let indexes = await page.evaluate(today => {
        let trs = document.querySelectorAll('#ctl00_ctl01_MainContentPlaceHolder_T2Main_calEffectiveDate > tbody > tr');
        let a;
        trs.forEach((tr,i) =>{
            if (i > 1) {
                tr.childNodes.forEach((td,i2) => {
                    if (td.firstChild.getAttribute('title') == today ) {
                        a = [i+1,i2+1];
                    }
                })
            }
        })
        return a;
    },today);

    const EFFECTIVE_DATE_SELECTOR = `#ctl00_ctl01_MainContentPlaceHolder_T2Main_calEffectiveDate > tbody > tr:nth-child(${indexes[0]}) > td:nth-child(${indexes[1]}) > a`;
    const EXPIRATION_DATE_SELECTOR = `#ctl00_ctl01_MainContentPlaceHolder_T2Main_calExpirationDate > tbody > tr:nth-child(${indexes[0]}) > td:nth-child(${indexes[1]}) > a`;
    await page.click(EFFECTIVE_DATE_SELECTOR);
    await page.waitForSelector(NEXT_BUTTON_SELECTOR);

    // later I can add buying permits for multiple days
    /*
    let indexes2 = await page.evaluate(today => {
        let trs = document.querySelectorAll('#ctl00_ctl01_MainContentPlaceHolder_T2Main_calExpirationDate > tbody > tr');
        console.log(trs);
        let a;
        trs.forEach((tr,i) =>{
             console.log(tr);
            if (i > 1) {
                tr.childNodes.forEach((td,i2) => {
                    console.log(td.firstChild.getAttribute('title'));
                    if (td.firstChild.getAttribute('title') == today ) {
                        a = [i+1,i2+1];
                    }
                })
            }
        })
        return a;
    },today);
    */

    await page.click(EXPIRATION_DATE_SELECTOR);
    await page.waitForSelector(NEXT_BUTTON_SELECTOR);

    await page.click(NEXT_BUTTON_SELECTOR);
    await page.waitForSelector(NEXT_BUTTON_SELECTOR);

    // unchecking extra vehicles
    await page.click('#ctl00_ctl01_MainContentPlaceHolder_T2Main_dgVehicleList_ctl03_chkChooseVehicles')
        .then(...resolveThen());
    await page.click('#ctl00_ctl01_MainContentPlaceHolder_T2Main_dgVehicleList_ctl04_chkChooseVehicles')
        .then(...resolveThen());

    await page.click(NEXT_BUTTON_SELECTOR);
    await page.waitForSelector(NEXT_BUTTON_SELECTOR);


    console.log("Choose the Location")
    // livi, busch, doug, cook
    await page.select(LOT_INPUT_SELECTOR,lotList.livi);
    await page.waitForSelector(NEXT_BUTTON_SELECTOR);
    await page.click(NEXT_BUTTON_SELECTOR);
    await page.waitForSelector(PAY_NOW_SELECTOR);
    console.log("View Cart Pay now")

    await page.click(PAY_NOW_SELECTOR);
    console.log("View Cart Pay now 2")
    await page.waitForSelector('input');
    console.log("View Cart Pay now 3")
    await page.waitForSelector('input');
    console.log("View Cart Pay now 4")

    await page.click('#cmdNext');
    console.log("View Cart Pay now 5")
    await page.waitForSelector('input');
    console.log("View Cart Pay now 6")
    await page.waitForNavigation({timeout: 3000}).then(...resolveThen());
    await page.waitForSelector(CONTINUE_SELECTOR);
    await page.focus(CONTINUE_SELECTOR);
    await page.click(CONTINUE_SELECTOR);
    await page.waitForNavigation({timeout: 3000}).then(...resolveThen());
    console.log("View Cart Pay now 7")
    /*
    await page.evaluate((contSelector) => {
        console.log(contSelector)
        let input = document.getElementById(contSelector);
        console.log(input,'input')
        input.click();
    },CONTINUE_SELECTOR);
    */
    console.log("View Cart Pay now 8")
    console.log("View Cart Pay now 9")
    console.log("Check out process order details")
    await page.waitForSelector(PAY_WITH_CARD_SELECTOR);
    await page.click(PAY_WITH_CARD_SELECTOR);
    await page.waitForSelector(CARD_TYPE_DROPDOWN_SELECTOR);
    console.log("payment");
    await page.select(CARD_TYPE_DROPDOWN_SELECTOR,'V');

    // add code for adding card info & billing address info

    // CARD INFO
    await page.click(FIRST_NAME_ON_CARD_SELECTOR);
    await page.keyboard.type(CREDS.bkooCard.firstName);

    await page.click(LAST_NAME_ON_CARD_SELECTOR);
    await page.keyboard.type(CREDS.bkooCard.lastName);

    await page.click(CARD_NUMBER_SELECTOR);
    await page.keyboard.type(CREDS.bkooCard.cardNumber);

    await page.click(CONFIRM_CARD_NUMBER_SELECTOR);
    await page.keyboard.type(CREDS.bkooCard.cardNumber);

    await page.click(CVV2_SELECTOR);
    await page.keyboard.type(CREDS.bkooCard.cvv2);

    await page.select(EXPIRATION_MONTH_DROPDOWN_SELECTOR,CREDS.bkooCard.expirationMonth);;

    await page.select(EXPIRATION_YEAR_DROPDOWN_SELECTOR,CREDS.bkooCard.expirationYear);;

    // BILLING ADDRESS
    await page.click(FIRST_NAME_SELECTOR);
    await page.keyboard.type(CREDS.bkooAddress.firstName);

    await page.click(LAST_NAME_SELECTOR);
    await page.keyboard.type(CREDS.bkooAddress.lastName);

    await page.click(ADDRESS_LINE_1_SELECTOR);
    await page.keyboard.type(CREDS.bkooAddress.address);

    await page.click(CITY_SELECTOR);
    await page.keyboard.type(CREDS.bkooAddress.city);

    await page.click(ZIPCODE_SELECTOR);
    await page.keyboard.type(CREDS.bkooAddress.zipCode);

    await page.select(STATE_DROPDOWN_SELECTOR,'NJ');

    // wait to see what i typed REMOVE ON PRODUCTION
    await page.waitForNavigation({timeout: 5000}).then(...resolveThen());

    await page.focus(CONTINUE_SELECTOR);
    await page.click(CONTINUE_SELECTOR);

    console.log('order summary');

    await page.waitForNavigation({timeout: 3000}).then(...resolveThen());

    await page.focus(CONTINUE_SELECTOR);
    await page.click(CONTINUE_SELECTOR);

    console.log('order confirmation')
    
    await page.waitForNavigation({timeout: 3000}).then(...resolveThen());
    }

run();
//browser.close();
