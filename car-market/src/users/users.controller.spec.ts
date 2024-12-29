import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { AuthService } from './auth.service'
import { User } from './user.entity'
import { NotFoundException } from '@nestjs/common'

describe('UsersController', () => {
  let controller: UsersController
  let fakeUsersService: Partial<UsersService>
  let fakeAuthService: Partial<AuthService>

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'john@mail.com',
          password: '1234',
        } as User)
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: '1234' } as User])
      },
      // remove: (id: number) => {},
      // update: () => {},
    }
    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User)
      },
      // signup: () => {},
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile()

    controller = module.get(UsersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('findAllUsers return a list of users with the given email', async () => {
    const users = await controller.findAllUsers('jon@mail.com')

    expect(users.length).toBe(1)
    expect(users[0].email).toBe('jon@mail.com')
  })

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1')

    expect(user).toBeDefined()
  })

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException)
  })

  it('signin updates session object and returns user', async () => {
    const session = { userId: -10 }

    const user = await controller.signIn(
      {
        email: 'john@mail.com',
        password: '1234',
      },
      session,
    )

    expect(user.id).toEqual(1)
    expect(session.userId).toEqual(1)
  })
})
