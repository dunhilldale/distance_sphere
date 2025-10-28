# \_vifit

To install dependencies:

```bash
bun install
```

To run:

```bash
npm start
```

Endpoints:

`POST http://localhost:3000/auth/login`
body: {
email:test@user.com
password:password
}

`GET http://localhost:3000/providers/nearby?latitude=1.3521&longitude=103.8198`
headers: {
Accept:application/json
Authorization:Bearer <token>
}

To run Testing:

```bash
bun test
```

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
