#from django.db.models.signals import post_save
#from django.dispatch import receiver
#from .models import Resume

#@receiver(post_save, sender=Resume)
#def application_notification(sender, instance, created, **kwargs):
 #   if created:
     #   print("Resume uploaded for:", instance.candidate_email)