var cheerio = require("cheerio"),
    urlMod = require("url");

module.exports = function (opts) {
  if (!opts) {
    opts = {};
  }

  return function (context) {
    var $;

    $ = context.$ || cheerio.load(context.body);
    context.$ = $;

    return $("a[href], link[href][rel=alternate]").map(function () {
      var $this,
          targetHref,
          absoluteTargetUrl,
          urlObj,
          protocol;

      $this = $(this);
      targetHref = $this.attr("href");
      absoluteTargetUrl = urlMod.resolve(context.url, targetHref);
      urlObj = urlMod.parse(absoluteTargetUrl);
      protocol = urlObj.protocol;

      if (protocol !== "http:" && protocol !== "https:") {
        return null;
      }

      // Restrict links to a particular group of hostnames.
      if (typeof opts.predicate !== "undefined") {
        if (!opts.predicate(urlObj.toString(), urlObj)) {
          return null;
        }
      }

      return urlMod.format({
        protocol: urlObj.protocol,
        auth: urlObj.auth,
        host: urlObj.host,
        pathname: urlObj.pathname,
        search: urlObj.search
      });
    }).get();
  };
};
