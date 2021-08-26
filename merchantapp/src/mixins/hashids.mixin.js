import Hashids from 'hashids';

const hashids = new Hashids('Localog');

export default {
  methods: {
    uuidToHash: function(uuid) {
      if (uuid && uuid.length)
        return hashids.encodeHex(uuid.replaceAll('-',''))
      else
        return null;
    },
    hashToUuid: function(hash) {
      return hashids.decode(hash);
    }
  }
}