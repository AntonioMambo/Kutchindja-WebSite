const express = require('express');
const postsController = require('../controllers/postsController')
const { identifier } = require('../middlewares/identification');
const router = express.Router();

router.post('/create-post', identifier, postsController.createPost);
router.get('/all-posts',identifier, postsController.listAllPosts);
router.get('/all-posts-logic',identifier, postsController.listAllPostsLogic);
router.get('/list-by-type', postsController.listByType);
router.patch('/update-post',identifier,  postsController.editPost);
router.delete('/delete-post', identifier, postsController.deletePost);



router.get('/single-post', postsController.singlePost);


module.exports = router;