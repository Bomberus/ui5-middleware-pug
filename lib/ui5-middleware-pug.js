/**
 * Pug UI5 middleware
 *
 * @param {object} parameters Parameters
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
module.exports = function({resources, middlewareUtil, options}) {
   const pug = require('pug');
   return function (req, res, next) {
     if (!req.path.endsWith(".xml")) {
       // Do not handle non-XML requests
       next();
       return;
     }
     // Try to read a corresponding pug file
     resources.rootProject.byPath(req.path.replace(".xml", ".pug")).then(async (resource) => {
       if (!resource) {
         // No file found, hand over to next middleware
         next();
         return;
       }
       const pugFile = await resource.getBuffer();
       // Generate XML from pug string
       // Remove HTML Tags
       const xml = pug.render(pugFile.toString(), {})
       res.type('.xml');
       res.end(xml);
     }).catch((err) => {
       next(err);
     });
   }
 };