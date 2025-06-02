import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);

router
    .route("/channel/:id")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/get-all-subscribers/:channelId").get(getUserChannelSubscribers);

export default router