import { Test } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UsersService } from './users.service'
import { User } from './user.entity'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('AuthService', () => {
  let service: AuthService
  let fakeUsersService: Partial<UsersService>

  beforeEach(async () => {
    // create fake copy of user service
    const users: User[] = []

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email)
        return Promise.resolve(filteredUsers)
      },
      create: (email: string, password: string) => {
        const newUser = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User

        users.push(newUser)

        return Promise.resolve(newUser)
      },
    }

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile()

    service = module.get(AuthService)
  })

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined()
  })

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('jon@mail.com', '1234')

    expect(user.password).not.toEqual('1234')
    const [salt, hash] = user.password.split('.')
    expect(salt).toBeDefined()
    expect(hash).toBeDefined()
  })

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('jon@mail.com', '1234')

    await expect(service.signup('jon@mail.com', '1234')).rejects.toThrow(
      BadRequestException,
    )
  })

  it('throws an error if user does not exist', async () => {
    await service.signup('jon@mail.com', '1234')

    await expect(service.signin('123123n@mail.com', '123123')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('throws if an invalid password is provided', async () => {
    await service.signup('jon@mail.com', '1234')

    await expect(service.signin('jon@mail.com', 'password')).rejects.toThrow(
      BadRequestException,
    )
  })

  it('returns user if correct password is provided', async () => {
    await service.signup('jon@mail.com', '1234')

    const user = await service.signin('jon@mail.com', '1234')
    expect(user).toBeDefined()
  })
})
