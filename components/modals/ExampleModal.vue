<template>
  <base-modal
    ref="modal"
    title="New Contact"
    :disabled="disabled"
    @done="onDone"
  >
    <base-form ref="form" v-slot="{ rules }" @submit="submit">
      <div class="-mt-3 flex justify-end">
        <base-switcher false-text="Company" true-text="Person" tabindex="-1" />
      </div>

      <base-progressive-fields-container
        :fields="fields"
        :data="tmp"
        group-by-required
      >
        <template #firstName="{ inputAttrs }">
          <base-input-text
            v-model="tmp.firstName"
            label="First Name"
            placeholder="Name"
            maxlength="100"
            :disabled="false"
            :rules="[rules.maxLength(100)]"
            v-bind="inputAttrs"
          >
            <template #prepend-icon>
              <img src="/images/flag/en.svg" class="h-5 w-5 rounded-full">
            </template>
          </base-input-text>
        </template>

        <template #phones="{ inputAttrs }">
          <base-multiple-inputs-wrapper
            v-model="tmp.phones"
            :new-item="() => ({ ...defaultNewPhone })"
            :is-empty="(item) => !item.countryCode || !item.phoneNumber"
          >
            <template #item="{ index }">
              <cw-input-phone v-model="tmp.phones[index]" v-bind="inputAttrs" />
            </template>
          </base-multiple-inputs-wrapper>
        </template>

        <template #surName="{ inputAttrs }">
          <base-input-text
            v-model="tmp.surName"
            label="Surname"
            placeholder="Surname"
            maxlength="100"
            :rules="[rules.maxLength(100)]"
            v-bind="inputAttrs"
          />
        </template>

        <template #email="{ inputAttrs }">
          <base-input-text
            v-model="tmp.email"
            type="email"
            label="Email"
            placeholder="Email"
            maxlength="100"
            :rules="{
              email: rules.email,
              unique: validateEmailUniqueness,
            }"
            v-bind="inputAttrs"
          >
            <template #error:unique>
              Double check the email. Is it
              <span class="example-email-correct-action">correct</span>?
            </template>
          </base-input-text>
        </template>

        <template #description="{ inputAttrs }">
          <base-textarea
            v-model="tmp.description"
            label="Short Description"
            placeholder="Short description"
            v-bind="inputAttrs"
          />
        </template>

        <template #about="{ inputAttrs }">
          <base-input-editor
            v-model="tmp.about"
            label="Text editor"
            placeholder="Text editor"
            :dynamic-fields="dynamicFields"
            :dynamic-entities="dynamicEntities"
            v-bind="inputAttrs"
          />
        </template>

        <template #country="{ inputAttrs }">
          <base-select
            v-model="tmp.country"
            label="Test dropdown"
            placeholder="Dropdown"
            :items="countries"
            item-text="name"
            item-value="id"
            v-bind="inputAttrs"
          />
        </template>

        <template #nationality="{ inputAttrs }">
          <base-select
            v-model="tmp.nationality"
            label="Test dropdown with suggestions"
            placeholder="Dropdown with suggestions"
            :items="countries"
            item-text="name"
            item-value="id"
            searchable
            v-bind="inputAttrs"
          />
        </template>

        <template #countries="{ inputAttrs }">
          <base-select
            v-model="tmp.countries"
            label="Multiple selections & suggestions"
            placeholder="Multiple selections & suggestions"
            :items="countries"
            item-text="name"
            item-value="id"
            hide-selected
            searchable
            sort-by-text
            v-bind="inputAttrs"
          >
            <template #empty>
              Not option left
            </template>

            <template #not-found>
              No result found
            </template>
          </base-select>
        </template>

        <template #interests="{ inputAttrs }">
          <base-select
            v-model="tmp.interests"
            label="Add non-exsited item"
            placeholder="Add non-exsited item"
            :items="interests"
            item-text="name"
            item-value="id"
            hide-selected
            searchable
            sort-by-text
            v-bind="inputAttrs"
            @no-exact-match-click="createNewInterest"
          >
            <template #selected-item-text="{ item }">
              <span
                :style="{
                  color:
                    item.id.startsWith && item.id.startsWith('new_')
                      ? 'red'
                      : '',
                }"
              >
                {{ item.name }}
              </span>
            </template>

            <template #empty>
              Not option left
            </template>

            <template #no-exact-match="{ searchText }">
              Create new interest "{{ searchText }}"
            </template>
          </base-select>
        </template>

        <template #date="{ inputAttrs }">
          <base-input-date
            v-model="tmp.date"
            label="Date"
            placeholder="Date"
            v-bind="inputAttrs"
          />
        </template>

        <template #picture="{ inputAttrs }">
          <base-input-photo
            v-model="tmp.picture"
            label="Upload profile picture"
            image-rounded
            v-bind="inputAttrs"
            @change="uploadImageFile"
          />
        </template>

        <template #items="{ inputAttrs }">
          <base-multiple-inputs-wrapper
            v-model="tmp.items"
            :new-item="() => ''"
          >
            <template #item="{ index }">
              <base-input-text
                ref="items"
                v-model="tmp.items[index]"
                :label="'Item ' + (index + 1)"
                :placeholder="'Item ' + (index + 1)"
                maxlength="100"
                :rules="[rules.maxLength(100)]"
                v-bind="inputAttrs"
              />
            </template>
          </base-multiple-inputs-wrapper>
        </template>
      </base-progressive-fields-container>
    </base-form>
  </base-modal>
</template>

<script>
export default {
  name: 'CwExampleModal',
  data () {
    return {
      fields: [
        { name: 'firstName', required: true },
        { name: 'surName', required: true },
        {
          name: 'phones',
          isEmpty: v => !v || !v[0] || !v[0].countryCode || !v[0].phoneNumber
        },
        { name: 'email', required: true },
        { name: 'description' },
        { name: 'about' },
        { name: 'country' },
        { name: 'nationality' },
        { name: 'countries' },
        { name: 'interests' },
        { name: 'date' },
        { name: 'picture' },
        { name: 'items', isEmpty: v => !v || !v[0] }
      ],

      tmp: {
        firstName: null,
        surName: null,
        phones: [],
        email: null,
        description: null,
        about: null,
        country: null,
        nationality: null,
        countries: [],
        interests: [],
        date: null,
        picture: null,
        items: []
      },

      countries: [
        { name: 'Afghanistan', id: 'AF' },
        { name: 'Country 2', id: 'C2' },
        { name: 'Country 3', id: 'C3' },
        { name: 'Country 4', id: 'C4' },
        { name: 'Country 5', id: 'C5' },
        { name: 'Country 6', id: 'C6' },
        { name: 'Country 7', id: 'C7' },
        { name: 'Country 8', id: 'C8' },
        { name: 'Country 9', id: 'C9' },
        { name: 'Country 10', id: 'C10' },
        { name: 'Country 11', id: 'C11' },
        { name: 'Country 12', id: 'C12' },
        {
          name:
            'Country 13kajsdh kajshdka jshdkasj hdaksjdh aksjhd kasjhd kasjhdkasjdhaksjdhas',
          id: 'C13'
        }
      ],

      interests: [
        { name: 'Interest 1 demo', id: '1' },
        { name: 'Interest 2 demo', id: '2' },
        { name: 'Interest 3 demo', id: '3' },
        { name: 'Interest 4 demo', id: '4' }
      ],

      dynamicFields: [
        { value: 'source.name', text: 'Source name' },
        { value: 'source.age', text: 'Source age' },
        { value: 'source.email', text: 'Source email' },
        { value: 'destination.name', text: 'Destination name' },
        { value: 'destination.age', text: 'Destination age' },
        { value: 'destination.email', text: 'Destination email' }
      ],

      dynamicEntities: {
        source: {
          name: 'demo-source-name',
          age: 'demo-source-age',
          email: 'demo-source-email'
        },
        destination: {
          name: 'demo-dest-name',
          age: 'demo-dest-age',
          email: 'demo-dest-email'
        }
      }
    }
  },
  computed: {
    disabled () {
      const { firstName, surName, email } = this.tmp
      return !firstName || !surName || !email
    },

    defaultNewPhone () {
      const [{ countryCode = null, prefixNumber = null }] = this.tmp.phones || [
        {}
      ]
      return { countryCode, prefixNumber, phoneNumber: null }
    }
  },
  methods: {
    show () {
      this.tmp = {
        firstName: null,
        surName: null,
        email: null,
        description: null,
        country: null,
        nationality: null,
        countries: [],
        interests: [],
        date: null,
        picture: null,
        items: ['']
      }

      this.$refs.modal.show()
    },

    onDone () {
      this.submit()
    },

    submit () {
      // eslint-disable-next-line no-console
      console.log(this.tmp)
    },

    uploadImageFile ({ file, src }) {
      // const res = this.$upload(formData)
      // this.tmp.picture = res.url
    },

    createNewInterest (interestName) {
      // In reality, this method should make a request to the server to
      // create a new interest
      const newId = 'new_' + this.interests.length + 1
      this.interests.push({ name: interestName, id: newId })
      this.tmp.interests = [...this.tmp.interests, newId]
    },

    validateEmailUniqueness () {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(true)
        }, 500)
      })
    }
  }
}
</script>

<style lang="scss">
.example-email-correct-action {
  text-decoration: underline;
  color: #fff;
  cursor: pointer;

  &:hover {
    color: #fff;
  }
}
</style>
