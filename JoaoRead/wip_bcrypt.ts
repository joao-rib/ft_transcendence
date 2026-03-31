import bcrypt from "bcrypt"; // TODO Include real path to encryption library

const isValid = await bcrypt.compare(
  "mypassword123",     // input
  storedHashFromDB     // stored hash
);
// isValid will return True if the password matches the hash. False otherwise.

const newHash = await bcrypt.hash("mypassword123", 10);

await prisma.account.create({
  data: {
    username,
    email,
    passwordHash: newHash
  }
});
// newHash will contain the hashed version of "mypassword123" with a salt rounds of 10.