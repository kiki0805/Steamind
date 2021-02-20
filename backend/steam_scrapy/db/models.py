# from peewee import *
from playhouse.sqlite_ext import *

db = SqliteExtDatabase('steam.db')

class BaseModel(Model):
    class Meta:
        database = db

class Game(BaseModel):
    appid = IntegerField(primary_key=True)
    name = CharField()
    header_img = TextField()
    website = TextField(null=True)
    developers = JSONField(default=[])
    publishers = JSONField(default=[])
    price = IntegerField()
    current_online = IntegerField(default=-1)
    total_positive = IntegerField(default=-1)
    total_negative = IntegerField(default=-1)


class User(BaseModel):
    steamid = CharField(unique=True)
    personaname = CharField()
    avatar = TextField()


class Genre(BaseModel):
    description = CharField()
    id = IntegerField(primary_key=True)


class Tag(BaseModel):
    name = CharField()
    tagid = IntegerField(primary_key=True)


class Review(Model):
    reviewer = ForeignKeyField(User)
    game = ForeignKeyField(Game)
    weight = FloatField()
    voted_up = BooleanField()

    class Meta:
        database = db
        indexes = ((('reviewer', 'game'), True), )


class GenreProps(Model):
    genre = ForeignKeyField(Genre)
    game = ForeignKeyField(Game)

    class Meta:
        database = db
        indexes = ((('genre', 'game'), True), )


class Tagged(Model):
    tag = ForeignKeyField(Tag)
    game = ForeignKeyField(Game)

    class Meta:
        database = db
        indexes = ((('tag', 'game'), True), )


class Playtime(Model):
    user = ForeignKeyField(User)
    game = ForeignKeyField(Game)
    time = IntegerField()

    class Meta:
        database = db
        indexes = ((('user', 'game'), True), )


class Recommended(Model):
    user = ForeignKeyField(User)
    tag = ForeignKeyField(Tag)

    class Meta:
        database = db
        indexes = ((('user', 'tag'), True), )


class Friendship(Model):
    user1 = ForeignKeyField(User)
    user2 = ForeignKeyField(User)

    class Meta:
        database = db
        constraints = [Check('user1_id > user2_id'), ]


all_defined_models = [Game, User, Genre, Tag, GenreProps, Tagged, Playtime, Recommended, Friendship, Review, ]
