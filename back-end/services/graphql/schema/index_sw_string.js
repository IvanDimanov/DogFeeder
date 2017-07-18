const { makeExecutableSchema } = require('graphql-tools')
const moment = require('moment')

const users = [
  {id: 1, firstName: 'Anakin', lastName: 'Skywalker', createdAt: '2017-06-17T10:00:00.000Z', deletedAt: '2017-07-17T10:00:00.000Z'},
  {id: 2, firstName: 'Dart', lastName: 'Vaider', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 3, firstName: 'The', lastName: 'Emperor', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 4, firstName: 'Luck', lastName: 'Skywalker', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 5, firstName: 'Lea', lastName: 'Skywalker', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 6, firstName: 'Han', lastName: 'Solo', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 7, firstName: 'The', lastName: 'Chui', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 8, firstName: 'General', lastName: 'Tarkin', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 9, firstName: 'Dart', lastName: 'Moll', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 10, firstName: 'Clone', lastName: 'Throoper 1', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 11, firstName: 'Clone', lastName: 'Throoper 2', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 12, firstName: 'Sky', lastName: 'Throoper 1', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 13, firstName: 'Sky', lastName: 'Throoper 2', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 14, firstName: 'Storm', lastName: 'Throoper 1', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 15, firstName: 'Storm', lastName: 'Throoper 2', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''},
  {id: 16, firstName: 'Eval', lastName: 'Chui', createdAt: '2017-07-17T10:00:00.000Z', deletedAt: ''}
]

const clouds = [
  {id: 1, name: 'Death Star 1', ownerId: 3, usersIds: [2, 10, 11], createdAt: '2017-06-17T10:00:00.000Z', deletedAt: '2017-07-17T10:00:00.000Z'},
  {id: 2, name: 'Death Star 2', ownerId: 2, usersIds: [8, 12, 13], createdAt: '2017-06-17T10:00:00.000Z', deletedAt: ''},
  {id: 3, name: 'Death Star 3', ownerId: 8, usersIds: [2, 14, 15, 16], createdAt: '2017-06-17T10:00:00.000Z', deletedAt: ''},
  {id: 4, name: 'Good guys', ownerId: 4, usersIds: [1, 5, 6, 7], createdAt: '2017-06-17T10:00:00.000Z', deletedAt: ''},
  {id: 5, name: 'Bad guys', ownerId: 3, usersIds: [2, 8, 9], createdAt: '2017-06-17T10:00:00.000Z', deletedAt: ''}
]

function getFilteredUsers ({ ids, name }) {
  let result = JSON.parse(JSON.stringify(users))

  if (ids) {
    result = result.filter(({id}) => ids.includes(id))
  }

  if (name) {
    result = result.filter(({firstName, lastName}) => firstName.toLowerCase().includes(name.toLowerCase()) || lastName.toLowerCase().includes(name.toLowerCase()))
  }

  return result
}

function getFilteredClouds ({ ids, name, user = {} }) {
  let result = JSON.parse(JSON.stringify(clouds))

  if (ids) {
    result = result.filter(({id}) => ids.includes(id))
  }

  if (name) {
    result = result.filter((cloud) => cloud.name.toLowerCase().includes(name.toLowerCase()))
  }

  if (user.ids) {
    result = result.filter(({usersIds}) => usersIds.find((userId) => user.ids.includes(userId)))
  }

  if (user.name) {
    result = result.filter(({usersIds}) => usersIds.find((userId) => {
      const {firstName = '', lastName = ''} = users.find((user) => user.id === userId) || {}
      return firstName.toLowerCase().includes(user.name.toLowerCase()) || lastName.toLowerCase().includes(user.name.toLowerCase())
    }))
  }

  return result
}

function getFormatedTime (time, timeFormat) {
  switch (timeFormat) {
    case 'MMDDYY':
      timeFormat = 'MM/DD/YY'
      break
    case 'MMDDYYYY':
      timeFormat = 'MM/DD/YYYY'
      break
    case 'DDMMYY':
      timeFormat = 'DD.MM.YY'
      break
    case 'DDMMYYYY':
      timeFormat = 'DD.MM.YYYY'
      break
    default:
      timeFormat = ''
  }

  return moment(time).format(timeFormat)
}

const typeDefs = `
  input UserInput {
    ids: [Int]
    name: String
  }

  type User {
    id: Int!
    firstName: String
    lastName: String

    # All the Clouds that this User is Joined
    clouds(ids: [Int], name: String, user: UserInput): [Cloud]

    # The exact time when the User registered
    createdAt(timeFormat: TimeFormat = MMDDYY): String!

    # No data ever get deleted from the DB - only marked with a time when it was requested to be deleted
    deletedAt(timeFormat: TimeFormat = MMDDYY): String
  }

  # A collection of Users with common goal
  type Cloud {
    id: Int!
    name: String

    # The one and only User that created the Cloud and has permissions over it
    owner: User

    # All Users Joined to this Cloud
    users(ids: [Int], name: String): [User]

    # The exact time when the owner User created the Cloud
    createdAt(timeFormat: TimeFormat = MMDDYY): String!

    # No data ever get deleted from the DB - only marked with a time when it was requested to be deleted
    deletedAt(timeFormat: TimeFormat = MMDDYY): String
  }

  # Default Time formatting for all DB time data
  enum TimeFormat {
    # Renders "MM/DD/YY"
    MMDDYY
    # Renders "MM/DD/YYYY"
    MMDDYYYY
    # Renders "DD/MM/YY"
    DDMMYY
    # Renders "DD/MM/YYYY"
    DDMMYYYY
  }

  # All ways you can Get data from the BE
  type Query {
    clouds(ids: [Int], name: String, user: UserInput): [Cloud]
    users(ids: [Int], name: String): [User]
  }

  # All ways you can Save data to the BE
  type Mutation {
    # Use when a User would like to Join a Cloud
    joinCloud(userId: Int!, cloudId: Int!): Cloud

    # Use when a User would like to Leave a Cloud
    leaveCloud(userId: Int!, cloudId: Int!): Cloud

    # Use when the User from JWT would like to Leave a Cloud
    loggedUserLeaveCloud(cloudId: Int!): Cloud
  }
`

const resolvers = {
  Query: {
    clouds: (source, args) => getFilteredClouds(args),
    users: (source, args) => getFilteredUsers(args)
  },

  Mutation: {
    joinCloud: (source, { userId, cloudId }) => {
      const user = users.find((user) => user.id === userId)
      if (!user) {
        throw new Error(`Couldn't find User with id '${userId}'`)
      }

      const cloud = clouds.find((cloud) => cloud.id === cloudId)
      if (!cloud) {
        throw new Error(`Couldn't find Cloud with id '${cloudId}'`)
      }

      if (cloud.usersIds.includes(userId)) {
        throw new Error(`User with id '${userId}' already joined Cloud with id '${cloudId}'`)
      }

      cloud.usersIds.push(userId)
      return new Promise((resolve) => setTimeout(() => resolve(cloud), 3000))
    },

    leaveCloud: (source, { userId, cloudId }) => {
      const user = users.find((user) => user.id === userId)
      if (!user) {
        throw new Error(`Couldn't find User with id '${userId}'`)
      }

      const cloud = clouds.find((cloud) => cloud.id === cloudId)
      if (!cloud) {
        throw new Error(`Couldn't find Cloud with id '${cloudId}'`)
      }

      if (!cloud.usersIds.includes(userId)) {
        throw new Error(`User with id '${userId}' is not in Cloud with id '${cloudId}'`)
      }

      cloud.usersIds.splice(cloud.usersIds.indexOf(userId), 1)
      return new Promise((resolve) => setTimeout(() => resolve(cloud), 3000))
    },

    loggedUserLeaveCloud: (source, { cloudId }, { token }) => {
      if (!token) {
        throw new Error(`Couldn't get the Authorization token`)
      }

      if (token.error) {
        throw new Error(`Couldn't get the Authorization token - ${token.error}`)
      }

      const { user } = token
      if (!user ||
          !user.id
        ) {
        throw new Error(`User in the JWT have no "id" property`)
      }

      const cloud = clouds.find((cloud) => cloud.id === cloudId)
      if (!cloud) {
        throw new Error(`Couldn't find Cloud with id '${cloudId}'`)
      }

      if (!cloud.usersIds.includes(user.id)) {
        throw new Error(`User with id '${user.id}' is not in Cloud with id '${cloudId}'`)
      }

      cloud.usersIds.splice(cloud.usersIds.indexOf(user.id), 1)
      return new Promise((resolve) => setTimeout(() => resolve(cloud), 3000))
    }
  },

  User: {
    clouds: (user, args) => {
      const usersIds = users.map(({id}) => id)
      if (args.ids) {
        args.ids = usersIds.filter((id) => args.ids.includes(id))
      } else {
        args.ids = usersIds
      }
      return getFilteredClouds(args)
    },
    createdAt: (user, args) => getFormatedTime(user.createdAt, args.timeFormat),
    deletedAt: (user, args) => getFormatedTime(user.deletedAt, args.timeFormat)
  },

  Cloud: {
    owner: (cloud) => users.find((user) => user.id === cloud.ownerId),
    users: (cloud, args) => {
      if (args.ids) {
        args.ids = cloud.usersIds.filter((id) => args.ids.includes(id))
      } else {
        args.ids = cloud.usersIds
      }
      return getFilteredUsers(args)
    },
    createdAt: (cloud, args) => getFormatedTime(cloud.createdAt, args.timeFormat),
    deletedAt: (cloud, args) => getFormatedTime(cloud.deletedAt, args.timeFormat)
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

module.exports = schema
