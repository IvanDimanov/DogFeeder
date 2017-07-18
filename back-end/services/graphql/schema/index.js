const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType
} = require('graphql')
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

const getFormatedTime = (time, timeFormat) => moment(time).format(timeFormat)

const TimeFormat = new GraphQLEnumType({
  name: 'TimeFormat',
  description: 'Default Time formatting for all DB time data',
  values: {
    MMDDYY: {
      value: 'MM/DD/YY',
      description: 'Renders "MM/DD/YY"'
    },
    MMDDYYYY: {
      value: 'MM/DD/YYYY',
      description: 'Renders "MM/DD/YYYY"'
    },
    DDMMYY: {
      value: 'DD.MM.YY',
      description: 'Renders "DD.MM.YY"'
    },
    DDMMYYYY: {
      value: 'DD.MM.YYYY',
      description: 'Renders "DD.MM.YYYY"'
    }
  }
})

const UserInput = new GraphQLInputObjectType({
  name: 'UserInput',
  description: 'Used to search for User',
  fields: () => ({
    ids: {
      type: new GraphQLList(GraphQLInt),
      description: 'Users unique identifications'
    },
    name: {
      type: GraphQLString,
      description: 'Search on both User firstName & lastName'
    }
  })
})

const User = new GraphQLObjectType({
  name: 'User',
  description: 'Registered User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'User unique identification'
    },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },

    clouds: {
      type: new GraphQLList(Cloud),
      description: 'All the Clouds that this User is Joined',
      resolve: (user, args) => {
        const usersIds = users.map(({id}) => id)
        if (args.ids) {
          args.ids = usersIds.filter((id) => args.ids.includes(id))
        } else {
          args.ids = usersIds
        }
        return getFilteredClouds(args)
      }
    },

    createdAt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The exact time when the User registered',
      args: {
        timeFormat: {
          type: TimeFormat,
          defaultValue: 'MM/DD/YY'
        }
      },
      resolve: (user, args) => getFormatedTime(user.createdAt, args.timeFormat)
    },

    deletedAt: {
      type: GraphQLString,
      description: 'No data ever get deleted from the DB - only marked with a time when it was requested to be deleted',
      args: {
        timeFormat: {
          type: TimeFormat,
          defaultValue: 'MM/DD/YY'
        }
      },
      resolve: (user, args) => getFormatedTime(user.createdAt, args.timeFormat)
    }
  })
})

const Cloud = new GraphQLObjectType({
  name: 'Cloud',
  description: 'A collection of Users with common goal',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Cloud unique identification'
    },
    name: { type: GraphQLString },

    owner: {
      type: new GraphQLNonNull(User),
      description: 'The one and only User that created the Cloud and has permissions over it',
      resolve: (cloud) => users.find((user) => user.id === cloud.ownerId)
    },

    users: {
      type: new GraphQLList(User),
      description: 'All Users Joined to this Cloud',
      resolve: (cloud, args) => {
        if (args.ids) {
          args.ids = cloud.usersIds.filter((id) => args.ids.includes(id))
        } else {
          args.ids = cloud.usersIds
        }
        return getFilteredUsers(args)
      }
    },

    createdAt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The exact time when the owner User created the Cloud',
      args: {
        timeFormat: {
          type: TimeFormat,
          defaultValue: 'MM/DD/YY'
        }
      },
      resolve: (user, args) => getFormatedTime(user.createdAt, args.timeFormat)
    },

    deletedAt: {
      type: GraphQLString,
      description: 'No data ever get deleted from the DB - only marked with a time when it was requested to be deleted',
      args: {
        timeFormat: {
          type: TimeFormat,
          defaultValue: 'MM/DD/YY'
        }
      },
      resolve: (user, args) => getFormatedTime(user.createdAt, args.timeFormat)
    }
  })
})

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: 'All methods you can use to get data',
    fields: {
      users: {
        type: new GraphQLList(User),
        args: {
          ids: {
            type: new GraphQLList(GraphQLInt),
            description: 'Users unique identifications'
          },
          name: {
            type: GraphQLString,
            description: 'User firstName or lastName includes this name'
          }
        },
        resolve: (source, args) => getFilteredUsers(args)
      },

      clouds: {
        type: new GraphQLList(Cloud),
        args: {
          ids: {
            type: new GraphQLList(GraphQLInt),
            description: 'Clouds unique identifications'
          },
          name: { type: GraphQLString },
          user: {
            type: UserInput,
            description: 'Users that are joined in this Cloud'
          }
        },
        resolve: (source, args) => getFilteredClouds(args)
      }
    }
  }),

  mutation: new GraphQLObjectType({
    name: 'Mutation',
    description: 'All ways you can Save data to the BE',
    fields: {
      joinCloud: {
        type: Cloud,
        description: 'Use when a User would like to Join a Cloud',
        args: {
          userId: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'User id to be added in the Cloud'
          },
          cloudId: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Cloud id where the User will be added'
          }
        },
        resolve: (source, { userId, cloudId }) => {
          const user = users.find((user) => user.id === userId)
          if (!user) {
            throw new Error(`Couldn't find User with id "${userId}"`)
          }

          const cloud = clouds.find((cloud) => cloud.id === cloudId)
          if (!cloud) {
            throw new Error(`Couldn't find Cloud with id "${cloudId}"`)
          }

          if (cloud.usersIds.includes(userId)) {
            throw new Error(`User with id "${userId}" already joined Cloud with id "${cloudId}"`)
          }

          cloud.usersIds.push(userId)
          return new Promise((resolve) => setTimeout(() => resolve(cloud), 3000))
        }
      },

      leaveCloud: {
        type: Cloud,
        description: 'Use when a User would like to Leave a Cloud',
        args: {
          userId: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'User id to be removed from the Cloud'
          },
          cloudId: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Cloud id where the User will be removed'
          }
        },
        resolve: (source, { userId, cloudId }) => {
          const user = users.find((user) => user.id === userId)
          if (!user) {
            throw new Error(`Couldn't find User with id "${userId}"`)
          }

          const cloud = clouds.find((cloud) => cloud.id === cloudId)
          if (!cloud) {
            throw new Error(`Couldn't find Cloud with id "${cloudId}"`)
          }

          if (!cloud.usersIds.includes(userId)) {
            throw new Error(`User with id "${userId}" is not in Cloud with id "${cloudId}"`)
          }

          cloud.usersIds.splice(cloud.usersIds.indexOf(userId), 1)
          return new Promise((resolve) => setTimeout(() => resolve(cloud), 3000))
        }
      },

      loggedUserLeaveCloud: {
        type: Cloud,
        description: 'Use when the User from JWT would like to Leave a Cloud',
        args: {
          cloudId: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Cloud id where the User will be removed'
          }
        },
        resolve: (source, { cloudId }, { token }) => {
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
            throw new Error(`Couldn't find Cloud with id "${cloudId}"`)
          }

          if (!cloud.usersIds.includes(user.id)) {
            throw new Error(`User with id "${user.id}" is not in Cloud with id "${cloudId}"`)
          }

          cloud.usersIds.splice(cloud.usersIds.indexOf(user.id), 1)
          return new Promise((resolve) => setTimeout(() => resolve(cloud), 3000))
        }
      }
    }
  })
})

module.exports = schema
