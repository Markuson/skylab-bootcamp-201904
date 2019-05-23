const validate = require('../common/validate')
const { LogicError, FormatError } = require('../common/errors')
const { Users, Notes } = require('../data/models')

const logic = {
    registerUser(name, surname, email, password) {
        validate.arguments([
            { name: 'name', value: name, type: 'string', notEmpty: true },
            { name: 'surname', value: surname, type: 'string', notEmpty: true },
            { name: 'email', value: email, type: 'string', notEmpty: true },
            { name: 'password', value: password, type: 'string', notEmpty: true }
        ])

        validate.email(email)

        return (async () => {
            const user = await Users.findOne({ email })

            if (user) throw new LogicError(`user with email "${email}" already exists`)

            try {
                await Users.create({ name, surname, email, password })
            } catch (error) {
                throw new Error(error)
            }


        })()
    },

    authenticateUser(email, password) {
        validate.arguments([
            { name: 'email', value: email, type: 'string', notEmpty: true },
            { name: 'password', value: password, type: 'string', notEmpty: true }
        ])

        validate.email(email)

        return (async () => {
            const users = await Users.find({email})

            if (!users.length) throw new LogicError(`user with email "${email}" does not exist`)

            const [user] = users

            if (user.password !== password) throw new LogicError('wrong credentials')

            return user.id
        })()
    },

    retrieveUser(id) {
        validate.arguments([
            { name: 'id', value: id, type: 'string', notEmpty: true }
        ])

        return (async () => {
            const user = await Users.findById(id)
            if (!user) throw new LogicError(`user with id "${id}" does not exist`)
            debugger
            const { name, surname, email } = user

            return { name, surname, email }
        })()
    },

    addPublicNote(author, note) {
        validate.arguments([
            { name: 'id', value: author, type: 'string', notEmpty: true },
            { name: 'note', value: note, type: 'string', notEmpty: true }
        ])

        return (async () => {
            try {
                await Notes.create({ text: note, author })
                return 'Message published'
            } catch (error) {
                throw new Error(error)
            }
        })()
    },

    addPrivateNote(author, note) {
        validate.arguments([
            { name: 'id', value: author, type: 'string', notEmpty: true },
            { name: 'note', value: note, type: 'string', notEmpty: true }
        ])

        return (async () => {
            try {
                const user = await Users.findById(author)
                const newPrivateNote = await Notes.create({ text: note, author })
                await user.notes.push(newPrivateNote)
                await user.save()
                return 'Message published'
            } catch (error) {
                throw new Error(error)
            }
        })()
    },

    deletePublicNote(noteId) {
        validate.arguments([
            { name: 'id', value: noteId, type: 'string', notEmpty: true }
        ])

        return (async () => {
            try {
                await Notes.findByIdAndDelete(noteId)
                return 'Message deleted'
            } catch (error) {
                throw new Error(error)
            }
        })()
    },
}

module.exports = logic