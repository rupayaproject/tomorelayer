from logzero import logger
import peewee as pw
from playhouse.postgres_ext import BinaryJSONField, ArrayField
from settings import database


class PwModel(pw.Model):

    class Meta:
        database = database
        only_save_dirty = True

    def __str__(self):
        return self.name


class Admin(PwModel):
    """
    True Owner of contract and database
    """
    name = pw.CharField(unique=True, max_length=200)
    address = pw.CharField(unique=True, max_length=200)


class Relayer(PwModel):
    owner = pw.CharField(max_length=200)
    name = pw.CharField(max_length=200, null=True)
    coinbase = pw.CharField(unique=True, max_length=200)
    deposit = pw.CharField()
    trade_fee = pw.IntegerField(default=1)
    from_tokens = ArrayField(pw.CharField, default=[])
    to_tokens = ArrayField(pw.CharField, default=[])
    logo = pw.CharField(max_length=200, null=True)
    domain = pw.CharField(max_length=255, null=True)
    link = pw.CharField(max_length=255, null=True)
    resigning = pw.BooleanField(default=False)
    lock_time = pw.IntegerField(null=True)
    idx = pw.IntegerField(null=True)

class Domain(PwModel):
    domain = pw.CharField(unique=True, max_length=200)
    coinbase = pw.CharField(unique=True, max_length=200)
    used = pw.BooleanField(default=False)


class Token(PwModel):
    name = pw.CharField(max_length=20)
    symbol = pw.CharField(max_length=20)
    logo = pw.CharField(null=True)
    address = pw.CharField(unique=True, max_length=200)
    total_supply = pw.CharField()
    decimals = pw.CharField(null=True)
    is_major = pw.BooleanField(default=False)


database.connect()
try:
    database.create_tables([
        Admin,
        Relayer,
        Token,
        Domain,
    ])
except Exception as err:
    logger.debug(err)
    logger.info('No need creating tables')
    database.rollback()
