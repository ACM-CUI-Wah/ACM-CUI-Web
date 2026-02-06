from rest_framework.parsers import MultiPartParser
from rest_framework.exceptions import ParseError
from django.http import QueryDict

# TODO: Customize parsing for files field in request
class CustomMultiPartParser(MultiPartParser):
    media_type = 'multipart/form-data'

    def parse(self, stream, media_type=None, parser_context=None):
        parsed_data = super().parse(stream, media_type, parser_context)
        data = parsed_data.data
        files = parsed_data.files
        try:
            images = QueryDict('', mutable=True)
            images['images'] = []
            image_list = files.getlist('images')
            print(image_list)
            for image in image_list:
                images['images'].append({
                    'image': image,
                })
            print(images)
            return {
                'data': data,
                'files': images,
            }
        except Exception as e:
            raise ParseError(f"File parsing failed: {str(e)}")