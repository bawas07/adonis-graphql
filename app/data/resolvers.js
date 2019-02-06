'use strict'

const User = use('App/Models/User')
const Post = use ('App/Models/Post')
const slugify = require('slugify')

const resolvers = {
    Query: {
        // fetch all users
        async allUsers() {
            const users = await User.all()
            return users.toJSON()
        },
        // Get a user by its ID
        async fetchUser(_, {id}) {
            const user = await User.find(id)
            return user.toJSON()
        },
        // Fetch all posts
        async allPosts() {
            const posts = await Post.all()
            return posts.toJSON()
        },
        // get a post by its id
        async fetchPost(_, {id}) {
            const post = await Post.find(id)
            return post.toJSON()
        }
    },

    Mutation: {
        //Handles user login
        async login(_, {email, password}, {auth}) {
            const {token} = await auth.attempt(email, password)
            return token
        },

        // Create new User
        async createUser(_, { username, email, password }) {
            return await User.create({ username, email, password })
        },

        // Add a new post
        async addPost(_, { title, content }, { auth }) {
            try {
                await auth.check()

                const user = await auth.getUser()

                return await Post.create({
                    user_id: user.id,
                    title,
                    slug: slugify(title, {lower: true}),
                    content
                })
            } catch (err) {
                throw new Error('Missing or invalid jwt token')
            }
        }
    },

    User: {
        // Fetch all posts created by a user
        async posts(userInJson) {
            // Convert JSON to model instance
            const user = new User()
            user.newUp(userInJson)

            const posts = await user.posts().fetch()
            return posts.toJSON()
        }
    },
    Post: {
        // Fetch the author of particular post
        async user(postInJson) {
            const post = new Post()
            post.newUp(postInJson)

            const user = await post.user().fetch()
            return user.toJSON()
        }
    }
}

module.exports = resolvers