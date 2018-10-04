import mysql.connector
from mysql.connector import Error
from pprint import pprint


mydb = mysql.connector.connect(
  host="localhost",
  user="matcha",
  passwd="matcha",
  database="matcha")

mycursor = mydb.cursor()

sql1 = mycursor.execute("SELECT * FROM `xlogins` where image_url not like 'https://cdn.intra.42.fr/users/default.png' ORDER BY id ASC;")
sql1 = mycursor.fetchall()

# pprint(sql1)

sql2 = mycursor.execute("SELECT id FROM `users` ORDER BY id ASC;")
sql2 = mycursor.fetchall()

it = 0
# pprint(sql1[it][9])
for line in sql2:
	# pprint(sql1[it][4])
	# pprint(sql1[it][7])
	# pprint(sql1[it][9])
	# pprint(sql1[it])
	# pprint(line[0])
	sql_upd = "UPDATE users SET first_name = \"{}\", last_name = \"{}\", login = \"{}\", avatar = \"{}\" WHERE id = {} ;".format(sql1[it][4], sql1[it][7], sql1[it][9],  sql1[it][6], line[0])
	mycursor.execute(sql_upd)
	mydb.commit()
	it += 1
