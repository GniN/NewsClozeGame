const searchQuery = 'YOUR QUERY'
const boardConfigs = [
    {
        name: `Gossiping`,
        age18: true
    },
    {
        name: `C_Chat`,
        age18: true
    }
]

const yahooNews = `https://tw.news.yahoo.com/search?p=${searchQuery}&fr=uh3_news_vert_gs&fr2=p%3Anews%2Cm%3Asb`

let age18Verified = false
const attachMode = false;

const puppeteer = require('puppeteer');

(async () => {
    let browser;
    if (attachMode) {
        const browserURL = 'http://127.0.0.1:9222';
        browser = await puppeteer.connect({ browserURL });
    } else {
        browser = await puppeteer.launch({
            headless: true
        });
    }
    const page = await browser.newPage();


    let titles = [];
    
    for(let i = 0; i < boardConfigs.length; i++) {
        const board = boardConfigs[i]

        titles.push(`-----------------${board.name}-------------------`)
        targetPage = `https://www.ptt.cc/bbs/${board.name}/search?q=${searchQuery}`
        await page.goto(targetPage, {
            waitUntil: 'domcontentloaded'
        });

        if (board.age18 && !age18Verified) {
            await page.setCookie({
                name: 'over18',
                value: '1'
            });

            await page.goto(targetPage, {
                waitUntil: 'domcontentloaded'
            })

            age18Verified = true
        }

        titles.push(...await page.evaluate(() => {
            const rs = []
            document.querySelectorAll(`.r-ent .title a`).forEach(titleLinkElement => {
                rs.push(titleLinkElement.innerText)
            })
            return rs
        }))

    }

    await page.goto(yahooNews, {
        waitUntil: 'domcontentloaded'
    })

    titles.push(`-----------------yahoo-------------------`)
    yahooPages = await page.evaluate(() => {
        const rs = []
        document.querySelectorAll(`.StreamMegaItem a`).forEach(titleLinkElement => {
            rs.push(titleLinkElement.innerText)
        })
        return rs
    })
    titles.push(...yahooPages.slice(0, 10))
    titles.filter(t => t.includes(searchQuery))

    titles = titles.map(t => t.replace(searchQuery, 'O'.repeat(searchQuery.length)))

    titles.forEach((t) => {
        console.log(t)
    })

    if (attachMode) {
        page.close()
        return process.exit(22)
    } else {
        browser.close()
    }
})();