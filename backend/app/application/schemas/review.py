from pydantic import BaseModel, Field


class ReviewRequest(BaseModel):
    comment: str = Field("", max_length=2000)


class ApproveRequest(BaseModel):
    comment: str = Field("", max_length=2000)