// ==UserScript==
// @name         LinkedIn Jobs Parser
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Jobs experience parser
// @author       You
// @match        https://www.linkedin.com/jobs/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=linkedin.com
// @grant        none
// ==/UserScript==

(function () {
    let lastUrl = location.href;
    onUrlChange();
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            onUrlChange();
        }
    }).observe(document, { subtree: true, childList: true });

    function onUrlChange() {
        const checkJobDescription = () => {
            const jobDescription = document.getElementsByClassName('jobs-description__container')[0];
            if (jobDescription && jobDescription.innerText.trim() !== '') {
                parseJobDescription();
            } else {
                setTimeout(checkJobDescription, 1000);
            }
        };

        checkJobDescription();
    }

    function parseJobDescription() {
        const jobDescription = document.getElementsByClassName('jobs-description__container')[0].innerText;
        const regex = /(\d+\s*(?:-|to)\s*\d+\s*(?:year|yr|years|yrs)s?|\d+\s*\+?\s*(?:year|yr|years|yrs)s?)(?![0-1][6-9]\s*(?:year|yr|years|yrs)s?|[2-9]\d+\s*(?:year|yr|years|yrs)s?)/ig;
        let matches = jobDescription.match(regex);
        let exp = '';
        try {
            exp = document.getElementById('exp_id');
            exp.remove();
        } catch (error) {
            console.log('not found');
        }
        let result = 'NO_EXP_PARSED';

        if (matches) {
            // Filter out matches greater than 15 years
            const filteredMatches = matches.filter(match => {
                const years = parseInt(match, 10);
                return years <= 15;
            });

            if (filteredMatches.length > 0) {
                result = filteredMatches[0];
            }
        } else {
            setTimeout(parseJobDescription, 1000);
        }

        exp = document.createElement('span');
        exp.id = 'exp_id';
        exp.innerHTML = '<b>' + result + ' · </b>';
        exp.style.width = "100%";
        let detailsContainer = document.getElementsByClassName('job-details-jobs-unified-top-card__primary-description-container')[0].getElementsByClassName('mb2')[0];
        detailsContainer.insertBefore(exp, detailsContainer.firstChild);


    }
})();
