const routes = require('express').Router();
const { getProxies } = require('../services/db');
const { catchAsyncRoute } = require('../utils/tools');

// -- GET ALL ----------------------------------------------------------------
routes.get('', catchAsyncRoute(async (req, res) => res.json(await getProxies())));


// -- ADD ------------------------------------------------------

routes.post('/:deviceId', async (req, res, next) => {
  const { deviceId } = req.params;
  const { city, description, userId } = req.body;

  const sql = `
      WITH "Device" AS (
        UPDATE "Devices" SET
          city = '${city}',
          description = '${description}',
          "userId" = ${userId}
        WHERE id = ${deviceId}
        RETURNING *
      )
      SELECT
        "Device".id,
        "Device".code,
        "Device".city,
        "Device".description,
        "Device"."appVersionCode",
        "Users".email as "userEmail",
        COALESCE(SUM("Statistics"."quantityPrinted"), 0) AS "quantityPrinted",
        COALESCE(JSONB_AGG(
          JSON_BUILD_OBJECT(
            'id', "Cartridges".id,
            'code', "Cartridges".code,
            'quantityResource', "Cartridges"."quantityResource",
            'quantityPrinted', "Statistics"."quantityPrinted",
            'lastActive', "Statistics"."lastActive"
          ) ORDER BY "Statistics"."lastActive" DESC
        ) FILTER (WHERE "Cartridges".id IS NOT NULL), '[]') AS cartridges
      FROM "Device"
      LEFT JOIN "Statistics" ON "Device".id = "Statistics"."deviceId"
      LEFT JOIN "Cartridges" ON "Statistics"."cartridgeId" = "Cartridges"."id"
      LEFT JOIN "Users" ON "Users".id = "Device"."userId"
      GROUP BY "Device".id, "Device".code, "Device".city,
        "Device".description, "Device"."appVersionCode", "Users".email
  `;
  const { 0: cartridge } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (!cartridge) return next(new Error('WRONG_PARAMS'));

  return res.json(cartridge);
});


// -- GET ID ------------------------------------------------------

routes.get('/:deviceId', async (req, res, next) => {
  const { deviceId } = req.params;

  const sql = `
    SELECT id, code, city, description, "userId"
      FROM "Devices"
      WHERE id = ${deviceId}
  `;

  const { 0: response } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (!response) return next(new Error('WRONG_PARAMS'));

  return res.json(response);
});

module.exports = routes;
