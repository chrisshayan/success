Meteor.methods({
   generateJobs: function(userId) {
       _.each(_.range(_.random(5, 50)), function() {
           var job = {
               title: faker.name.jobTitle(),
               city: _.random(1,2),
               description: faker.lorem.sentences(),
               requirements: faker.lorem.sentences(),
               benifits: faker.lorem.sentences(),
               salaryMin: _.random(300, 600),
               salaryMax: _.random(600, 1500),
               tags: [],
               createdAt: new Date(),
               modifiedAt: new Date(),
               createdBy: userId,
               modifiedBy: userId
           }
            console.log(job);
           Collections.Jobs.insert(job);
       })
   }
});