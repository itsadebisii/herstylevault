/* The three Style Reports, in one place. The shop page, the quiz, the checkout, the report builder and the server all read this file.
   To change a price, a name or a Stripe link, change it here and nowhere else (then run: node scripts/build_product_pages.js).

   price        dollars. It must match the Stripe Payment Link for that report exactly: the server works out which report
                a customer bought from the amount on her Stripe checkout, so a mismatch would give her the wrong report.
   link         the Stripe Payment Link. Leave 'STRIPE_LINK_HERE' until you have made it; that keeps the report from being bought.
                In Stripe, set each link to send her back to:  https://herstylevault.com/analysis-results.html?session_id={CHECKOUT_SESSION_ID}
   includedIn   the package that comes with this report (shown as "included with ...", not as the report's name)
   blurb        the tiny description shown wherever she picks a report                                                              */
(function (root) {
  var T = {
    order: ['starter', 'blueprint', 'signature'],
    legacyCents: [4000], /* reports sold before the three options existed ($40) are treated as the full Signature report */
    starter: {
      key: 'starter', name: 'Starter Style Report', short: 'Starter', price: 25,
      link: 'STRIPE_LINK_HERE',
      includedIn: 'The Unlock', questions: 12, pages: 10,
      blurb: 'Your colors, and outfit ideas to start with.', cover: 'images/digitals/report-cover-starter.jpg'
    },
    blueprint: {
      key: 'blueprint', name: 'Blueprint Style Report', short: 'Blueprint', price: 35,
      link: 'STRIPE_LINK_HERE',
      includedIn: 'The Vault Edit', questions: 20, pages: 15,
      blurb: 'Your colors and body shape, with a closet plan.', cover: 'images/digitals/report-cover-blueprint.jpg'
    },
    signature: {
      key: 'signature', name: 'Signature Style Report', short: 'Signature', price: 55,
      link: 'STRIPE_LINK_HERE',
      includedIn: 'The Full Reveal', questions: 26, pages: 21,
      blurb: 'The full picture: colors, shape, style persona and shopping.', cover: 'images/digitals/report-cover.jpg'
    }
  };
  T.get = function (k) { return T[k] && T[k].key ? T[k] : T.signature; };
  T.valid = function (k) { return T.order.indexOf(k) > -1; };
  T.live = function (k) { var t = T.get(k); return !!t.link && !/STRIPE_LINK_HERE/.test(t.link); };
  T.rank = function (k) { return Math.max(0, T.order.indexOf(k)); };
  T.money = function (k) { return '$' + T.get(k).price; };
  /* which report a checkout paid for, from the list price in cents (before any discount code) */
  T.fromCents = function (cents) {
    for (var i = 0; i < T.order.length; i++) { if (T[T.order[i]].price * 100 === cents) return T.order[i]; }
    return 'signature';
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = T; else root.HSV_TIERS = T;
})(typeof window !== 'undefined' ? window : this);
